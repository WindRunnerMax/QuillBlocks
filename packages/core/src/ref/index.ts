import { Bind } from "block-kit-utils";

import type { Editor } from "../editor";
import type { ContentChangeEvent } from "../event/bus/types";
import { EDITOR_EVENT } from "../event/bus/types";
import { RawRange } from "../selection/modules/raw-range";
import type { RawRangeRef } from "./types";

export class Ref {
  /** 选区 */
  protected rangeRefs: Set<RawRangeRef>;

  /**
   * 构造函数
   */
  constructor(protected editor: Editor) {
    this.rangeRefs = new Set();
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.transform);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.rangeRefs.clear();
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.transform);
  }

  /**
   * range 创建引用
   * @param range
   */
  public range(range: RawRange) {
    const ref: RawRangeRef = {
      current: range,
      unref: () => this.unref(ref),
    };
    this.rangeRefs.add(ref);
    if (process.env.NODE_ENV === "development") {
      if (this.rangeRefs.size > 100) {
        this.editor.logger.warning("RangeRefs size is too large");
      }
    }
    return ref;
  }

  /**
   * 拆离引用
   * @param ref
   */
  protected unref(ref: RawRangeRef) {
    const current = ref.current;
    this.rangeRefs.delete(ref);
    ref.current = null;
    return current;
  }

  /**
   * 转换引用
   * @param event
   */
  @Bind
  protected transform(event: ContentChangeEvent) {
    const { changes } = event;
    for (const ref of this.rangeRefs) {
      const raw = ref.current;
      if (!raw) continue;
      const start = changes.transformPosition(raw.start);
      const end = raw.len ? changes.transformPosition(raw.start + raw.len) : start;
      const range = new RawRange(start, end - start);
      ref.current = range;
    }
  }
}
