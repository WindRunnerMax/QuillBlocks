import type { AttributeMap, Op } from "block-kit-delta";
import type { InsertOp } from "block-kit-delta";
import { Delta } from "block-kit-delta";

import type { Editor } from "../../editor";
import type { BlockState } from "../modules/block-state";
import { LeafState } from "../modules/leaf-state";
import { LineState } from "../modules/line-state";
import { ImmutableDelta } from "./delta";

/**
 * 维护 Immutable State
 */
export class Mutate {
  /** 初始 Delta */
  private prevDelta: ImmutableDelta;
  /** 目标 Delta */
  private nextDelta: ImmutableDelta;
  /** Op To LeafState */
  private opToState: WeakMap<Op, LeafState>;
  /** Attributes To LeafState */
  private attributesToState: WeakMap<AttributeMap, LineState>;

  constructor(private editor: Editor, private block: BlockState) {
    const lines = block.getLines();
    const ops: Op[] = [];
    this.opToState = new WeakMap();
    this.attributesToState = new WeakMap();
    for (const line of lines) {
      const leaves = line.getLeaves();
      for (const leaf of leaves) {
        ops.push(leaf.op);
        this.opToState.set(leaf.op, leaf);
      }
      this.attributesToState.set(line.attributes, line);
    }
    this.prevDelta = new ImmutableDelta(ops);
    this.nextDelta = this.prevDelta;
  }

  /**
   * Immutable Compose
   * @param Delta
   */
  public compose(delta: Delta): ImmutableDelta {
    this.nextDelta = this.prevDelta.compose(delta);
    return this.nextDelta;
  }

  /**
   * Get Latest Ops
   */
  public getLatestOps(): Op[] {
    return this.nextDelta.ops;
  }

  /**
   * Immutable Apply
   * @returns 更新过后的 Lines
   */
  public apply() {
    // TODO: 在多行文档中修改小部分行场景下
    // 直接标记无需修改的行状态, 避免大量遍历
    const lines: LineState[] = [];
    this.nextDelta.eachLine((delta, attributes) => {
      const ops = delta.ops as InsertOp[];
      let lineState: LineState | null = null;
      for (let i = 0, n = ops.length; i < n; i++) {
        const op = ops[i];
        const leafState = this.opToState.get(op);
        // 取首节点的 LineState 作为判断基准
        // FIX: 当删除时先前的 ops 不会变更, 对比通过但实际长度不对应
        // 导致操作的 DOM 无法正确删除, 且继续删除时出现无限重复删除节点问题
        if (!i && leafState && leafState.parent.getLeaves().length === n) {
          lineState = leafState.parent;
          continue;
        }
        // 当不存在 Leaf 或者 Leaf 的父级不是当前 Line 时
        // 说明该行 ops/attrs 发生了改变, 需要重新构建 LineState
        if (!leafState || leafState.parent !== lineState) {
          lineState = null;
          break;
        }
      }
      if (!lineState) {
        lineState = new LineState(this.editor, new Delta(), attributes, this.block);
        // COMPAT: 避免实例化 LineState 时建立无效 LeafState 状态, 重设内建 delta
        lineState._setDelta(delta);
      }
      ops.forEach((op, i) => {
        let leafState = this.opToState.get(op);
        if (!leafState) {
          leafState = new LeafState(i, 0, op, lineState!);
        }
        lineState!.setLeaf(leafState, i);
      });
      lines.push(lineState!);
    });
    return lines;
  }
}
