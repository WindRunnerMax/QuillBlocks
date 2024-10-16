import type { Op } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import { cloneOps } from "block-kit-delta";

import type { Editor } from "../../editor";
import { Key } from "../utils/key";
import { LineState } from "./line-state";

export class BlockState {
  /** Block 内容长度 */
  public size = 0;
  /** Block Key */
  public readonly key: string;
  /** LineState 集合 */
  private lines: LineState[] = [];

  constructor(private editor: Editor, private block: Delta) {
    this.key = Key.getId(this);
    this.createLinesModel(block);
  }

  /**
   * 初始化创建 LineState
   * @param block
   */
  private createLinesModel(block: Delta) {
    let offset = 0;
    this.lines = [];
    block.eachLine((delta, attributes, index) => {
      const lineState = new LineState(this.editor, delta, attributes, this);
      lineState.index = index;
      lineState.start = offset;
      offset = offset + lineState.size;
      this.lines[index] = lineState;
    });
    this.size = offset;
  }

  /**
   * 按照索引获取 LineState
   */
  public getLine(index: number): LineState | null {
    return this.lines[index] || null;
  }

  /**
   * 获取所有 LineState
   */
  public getLines() {
    return this.lines;
  }

  /**
   * 更新所有 LineState
   * @param lines
   * @returns 块宽度
   */
  public updateLines(lines?: LineState[]) {
    if (lines) {
      this.lines = lines;
    }
    let offset = 0;
    this.lines.forEach((state, index) => {
      state.index = index;
      state.start = offset;
      const size = state.isDirty ? state.updateLeaves() : state.size;
      offset = offset + size;
    });
    this.size = offset;
    return offset;
  }

  /**
   * 转换为 Delta
   * @param deep 深拷贝
   */
  public toDelta(deep?: boolean) {
    const ops: Op[] = [];
    for (const line of this.lines) {
      ops.push(...line.getOps());
    }
    return new Delta({
      ops: deep ? cloneOps(ops) : ops,
    });
  }
}
