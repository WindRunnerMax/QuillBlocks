import type { AttributeMap, Op } from "block-kit-delta";
import type { InsertOp } from "block-kit-delta";
import { getOpLength, isEOLOp } from "block-kit-delta";
import { Bind } from "block-kit-utils";

import type { Editor } from "../editor";
import type { SelectionChangeEvent } from "../event/bus/types";
import { EDITOR_EVENT } from "../event/bus/types";
import type { Point } from "../selection/modules/point";
import type { Range } from "../selection/modules/range";
import type { LeafState } from "../state/modules/leaf-state";
import { isLeafOffsetTail } from "./utils/is";

export class Collect {
  /** 选区折叠时的 marks */
  public marks: AttributeMap = {};

  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, this.onSelectionChange);
  }

  /**
   * 基于 Point 获取索引位置的 Leaf
   * @param point
   */
  public getLeafAtPoint(point: Point): LeafState | null {
    const block = this.editor.state.block;
    const line = block.getLine(point.line);
    if (!line) return null;
    const leaves = line.getLeaves();
    let index = point.offset;
    for (const leaf of leaves) {
      const opLength = leaf.length;
      if (opLength >= index) return leaf;
      index = index - opLength;
    }
    return null;
  }

  /**
   * 基于 Point 获取索引位置的 Op
   * @param point
   */
  public getOpAtPoint(point: Point): Op | null {
    const leaf = this.getLeafAtPoint(point);
    if (!leaf) return null;
    return leaf.op;
  }

  /**
   * 基于 Ops 获取 Length 位置的 Op
   * @param ops
   * @param length
   */
  public getOpAtLength(ops: Op[], length: number): Op | null {
    let index = length;
    for (const op of ops) {
      const opLength = getOpLength(op);
      if (opLength >= index) {
        return op;
      }
      index = index - opLength;
    }
    return null;
  }

  /**
   * 通过 Range 获取 Delta 片段
   * @param range
   */
  public getFragment(range?: Range): Op[] | null {
    const at = range || this.editor.selection.get();
    if (!at || at.isCollapsed) return null;
    const { start, end } = at;
    const block = this.editor.state.block;
    // 如果是同行则直接 slice
    if (start.line === end.line) {
      const lineState = block.getLine(start.line);
      const nextOps = lineState ? lineState.slice(start.offset, end.offset) : [];
      return nextOps;
    }
    const ops: Op[] = [];
    // 处理首行
    const firstLine = block.getLine(start.line);
    const firstOps = firstLine ? firstLine.slice(start.offset, firstLine.length) : [];
    ops.push(...firstOps);
    // 处理中间行
    for (let i = start.line + 1, len = end.line - 1; i <= len; i++) {
      const lineState = block.getLine(i);
      if (!lineState) continue;
      ops.push(...lineState.getOps());
    }
    // 处理尾行
    const lastLine = block.getLine(end.line);
    const lastOps = lastLine ? lastLine.slice(0, end.offset) : [];
    ops.push(...lastOps);
    return ops;
  }

  /**
   * 基于 Point 获取索引位置的 Op 内容
   * @param point
   */
  public getBackwardOpAtPoint(point: Point): InsertOp | null {
    const leaf = this.getLeafAtPoint(point);
    if (!leaf) return null;
    return leaf.sliceOp(point.offset - leaf.offset);
  }

  /**
   * 向前查找基于 Point 获取索引位置的 Op 内容
   * @param point
   */
  public getForwardOpAtPoint(point: Point): InsertOp | null {
    const block = this.editor.state.block;
    const line = block.getLine(point.line);
    if (!line) return null;
    const leaves = line.getLeaves();
    let index = point.offset;
    for (const leaf of leaves) {
      const opLength = leaf.length;
      if (opLength > index) {
        return leaf.sliceOp(index, true);
      }
      index = index - opLength;
    }
    return null;
  }

  /**
   * 过滤需要追踪的属性
   * - mark: 输入时会自动追踪样式的节点
   * - mark + inline: 不追踪末尾 Mark
   * @param leaf 叶子结点状态
   * @param isLeafTail 是否在节点尾部
   */
  public getLeafMarks(
    leaf: LeafState | null,
    isLeafTail: boolean | null
  ): AttributeMap | undefined {
    const op = leaf && leaf.op;
    if (!leaf || !op || !op.insert || !op.attributes || isEOLOp(op)) {
      return void 0;
    }
    const attrs = op.attributes;
    const keys = Object.keys(attrs);
    const result: AttributeMap = {};
    for (const key of keys) {
      if (this.editor.schema.mark.has(key) && attrs[key]) {
        result[key] = attrs[key];
      }
      if (isLeafTail && this.editor.schema.inline.has(key)) {
        const next = leaf.next(false);
        // 如果下个节点存在相同的属性, 则仍然需要追加属性
        if (next && next.op.attributes && next.op.attributes[key]) {
          continue;
        }
        delete result[key];
      }
    }
    return Object.keys(result).length ? result : void 0;
  }

  /**
   * 选区变化
   * @param event
   */
  @Bind
  protected onSelectionChange(event: SelectionChangeEvent) {
    const current = event.current;
    if (!current || !current.isCollapsed) {
      this.marks = {};
      return void 0;
    }
    const point = current.start;
    const leaf = this.editor.collect.getLeafAtPoint(point);
    // FIX: 当前节点为 void 时, 不需要处理文本
    if (leaf && leaf.void) return void 0;
    const isLeafTail = isLeafOffsetTail(leaf, point);
    const attributes = this.getLeafMarks(leaf, isLeafTail);
    this.marks = attributes || {};
    return void 0;
  }
}
