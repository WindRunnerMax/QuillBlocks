import type { Delta } from "block-kit-delta";

import type { Editor } from "../editor";
import type { ContentChangeEvent } from "../event/bus/types";
import { EDITOR_EVENT } from "../event/bus/types";
import { Range } from "../selection/modules/range";
import { RawRange } from "../selection/modules/raw-range";
import { BlockState } from "./modules/block-state";
import { Mutate } from "./mutate";
import type { ApplyOptions } from "./types";
import { EDITOR_STATE } from "./types";

export class EditorState {
  /** Delta 缓存 */
  private _delta: Delta | null;
  /** BlockState 引用 */
  public block: BlockState;
  /** 内建状态集合 */
  private status: Record<string, boolean> = {};

  constructor(private editor: Editor, delta: Delta) {
    this._delta = delta;
    this.block = new BlockState(editor, delta);
  }

  /**
   * 获取编辑器状态
   * @param key
   */
  public get(key: keyof typeof EDITOR_STATE) {
    return this.status[key];
  }

  /**
   * 设置编辑器状态
   * @param key
   * @param value
   */
  public set(key: keyof typeof EDITOR_STATE, value: boolean) {
    this.status[key] = value;
    return this;
  }

  /**
   * 判断焦点是否在编辑器内
   */
  public isFocused() {
    return !!this.get(EDITOR_STATE.FOCUS);
  }

  /**
   * 判断编辑器是否只读
   */
  public isReadonly() {
    return !!this.get(EDITOR_STATE.READONLY);
  }

  /**
   * 判断编辑器是否正在组合输入
   */
  public isComposing() {
    return !!this.get(EDITOR_STATE.COMPOSING);
  }

  /**
   * 转换为 BlockSet
   * @param deep 深拷贝
   * @note 以内建状态为主, BlockSet 按需转换
   */
  public toBlockSet(deep?: boolean) {
    if (!deep && this._delta) {
      return this._delta;
    }
    const delta = this.block.toDelta(deep);
    this._delta = delta;
    return delta;
  }

  /**
   * 应用变更
   * @param delta
   * @param options
   */
  public apply(delta: Delta, options: ApplyOptions = {}) {
    const { source = "user" } = options;
    const previous = this.toBlockSet();
    this._delta = null;

    // 获取当前选区位置
    const raw: RawRange | null = options.range || this.editor.selection.toRaw();
    const payload = { previous, current: previous, source, changes: delta };
    this.editor.event.trigger(EDITOR_EVENT.CONTENT_WILL_CHANGE, payload);

    // 更新 BlockSet Model
    const mutate = new Mutate(this.block);
    const newLines = mutate.compose(delta);
    this.block.updateLines(newLines);

    // 更新选区位置
    if (raw) {
      const start = delta.transformPosition(raw.start);
      const end = raw.len ? delta.transformPosition(raw.start + raw.len) : start;
      const range = Range.fromRaw(this.editor, new RawRange(start, end - start));
      this.editor.selection.set(range);
    }

    const current = this.toBlockSet();
    Promise.resolve().then(() => {
      const payload: ContentChangeEvent = { previous, current, source, changes: delta };
      this.editor.logger.debug("Editor Content Change", payload);
      this.editor.event.trigger(EDITOR_EVENT.CONTENT_CHANGE, payload);
    });
  }
}
