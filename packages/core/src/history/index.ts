import type { Delta } from "block-kit-delta";
import { isRetainOp } from "block-kit-delta";

import type { Editor } from "../editor";
import type { ContentChangeEvent } from "../event/bus/types";
import { EDITOR_EVENT } from "../event/bus/types";
import { isRedo, isUndo } from "../input/utils/hot-key";
import { Range } from "../selection/modules/range";
import { RawRange } from "../selection/modules/raw-range";
import { APPLY_SOURCE } from "../state/types";
import type { StackItem } from "./types";

export class History {
  /** 延时 */
  private readonly DELAY = 1000;
  /** 堆栈最大值 */
  private readonly STACK_SIZE = 100;
  /** 前次执行记录时间 */
  private lastRecorded: number;
  /** UNDO 栈 */
  private undoStack: StackItem[];
  /** REDO 栈 */
  private redoStack: StackItem[];
  /** 当前选区 */
  private currentRange: RawRange | null;

  /**
   * 构造函数
   * @param editor
   */
  constructor(private editor: Editor) {
    this.redoStack = [];
    this.undoStack = [];
    this.lastRecorded = 0;
    this.currentRange = null;
    this.editor.event.on(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
    this.editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
    this.editor.event.on(EDITOR_EVENT.CONTENT_WILL_CHANGE, this.onContentWillChange);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.undoStack = [];
    this.redoStack = [];
    this.editor.event.off(EDITOR_EVENT.KEY_DOWN, this.onKeyDown);
    this.editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, this.onContentChange);
    this.editor.event.off(EDITOR_EVENT.CONTENT_WILL_CHANGE, this.onContentWillChange);
  }

  /**
   * UNDO
   */
  public undo() {
    if (!this.undoStack.length) return void 0;
    const item = this.undoStack.pop();
    if (!item) return void 0;
    const base = this.editor.state.toBlockSet();
    const inverted = item.delta.invert(base);
    this.redoStack.push({
      delta: inverted,
      range: this.transformRange(item.range, inverted),
    });
    this.lastRecorded = 0;
    this.editor.state.apply(item.delta, { source: APPLY_SOURCE.HISTORY });
    this.restoreSelection(item);
  }

  /**
   * REDO
   */
  public redo() {
    if (!this.redoStack.length) return void 0;
    const item = this.redoStack.pop();
    if (!item) return void 0;
    const base = this.editor.state.toBlockSet();
    const inverted = item.delta.invert(base);
    this.undoStack.push({
      delta: inverted,
      range: this.transformRange(item.range, inverted),
    });
    this.lastRecorded = 0;
    this.editor.state.apply(item.delta, { source: APPLY_SOURCE.HISTORY });
    this.restoreSelection(item);
  }

  /**
   * 获取最新选区
   */
  private onContentWillChange = () => {
    const range = this.editor.selection.toRaw();
    this.currentRange = range;
  };

  /**
   * 处理内容变更事件
   * @param event
   */
  private onContentChange = (event: ContentChangeEvent) => {
    const { changes, previous, source } = event;
    if (!changes.ops.length || source === APPLY_SOURCE.HISTORY) {
      return void 0;
    }
    if (event.source === APPLY_SOURCE.REMOTE) {
      this.transformStack(this.undoStack, changes);
      this.transformStack(this.redoStack, changes);
      return void 0;
    }
    this.redoStack = [];
    let inverted = changes.invert(previous);
    let undoRange = this.currentRange;
    const timestamp = Date.now();
    if (this.lastRecorded + this.DELAY > timestamp && this.undoStack.length > 0) {
      const item = this.undoStack.pop();
      if (item) {
        inverted = inverted.compose(item.delta);
        undoRange = item.range;
      }
    } else {
      this.lastRecorded = timestamp;
    }
    if (!inverted.ops.length) {
      return void 0;
    }
    this.undoStack.push({ delta: inverted, range: undoRange });
    if (this.undoStack.length > this.STACK_SIZE) {
      this.undoStack.shift();
    }
  };

  /**
   * 变换远程堆栈
   * @param stack
   * @param delta
   */
  private transformStack(stack: StackItem[], delta: Delta) {
    let remoteDelta = delta;
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      const prevItem = stack[i];
      stack[i] = {
        delta: remoteDelta.transform(prevItem.delta, true),
        range: prevItem.range && this.transformRange(prevItem.range, remoteDelta),
      };
      remoteDelta = prevItem.delta.transform(remoteDelta);
      if (!stack[i].delta.ops.length) {
        stack.splice(i, 1);
      }
    }
  }

  /**
   * 变换选区
   * @param range
   * @param delta
   */
  private transformRange(range: RawRange | null, delta: Delta) {
    if (!range) return range;
    const start = delta.transformPosition(range.start);
    const end = delta.transformPosition(range.start + range.len);
    return new RawRange(start, end - start);
  }

  /**
   * 恢复选区位置
   * @param stackItem
   */
  private restoreSelection(stackItem: StackItem) {
    if (stackItem.range) {
      const range = Range.fromRaw(this.editor, stackItem.range);
      this.editor.selection.set(range);
    } else {
      let index = 0;
      if (isRetainOp(stackItem.delta.ops[0])) {
        index = stackItem.delta.ops[0].retain;
      }
      const rawRange = RawRange.fromEdge(index, index);
      const range = Range.fromRaw(this.editor, rawRange);
      this.editor.selection.set(range);
    }
  }

  /**
   * 键盘事件
   * @param event
   */
  private onKeyDown = (event: KeyboardEvent) => {
    if (isUndo(event)) {
      this.undo();
      event.preventDefault();
    }
    if (isRedo(event)) {
      this.redo();
      event.preventDefault();
    }
  };
}
