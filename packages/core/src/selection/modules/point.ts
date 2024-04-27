import type { Editor } from "../../editor";

export class Point {
  constructor(public readonly offset: number, public readonly blockId: string) {}

  clone() {
    return new Point(this.offset, this.blockId);
  }

  public static from(offset: number, blockId: string) {
    return new Point(offset, blockId);
  }

  public static isEqual(origin: Point | null, target: Point | null): boolean {
    if (origin === target) return true;
    if (!origin || !target) return false;
    return origin.offset === target.offset && origin.blockId === target.blockId;
  }

  public static isBackward(origin: Point | null, target: Point | null, editor?: Editor): boolean {
    if (!origin || !target) return false;
    if (origin.blockId === target.blockId) {
      return origin.offset > target.offset;
    }
    if (!editor) return false;
    const startBlock = editor.state.getBlockState(origin.blockId);
    const endBlock = editor.state.getBlockState(target.blockId);
    if (!startBlock || !endBlock) return false;
    return startBlock.index > endBlock.index;
  }
}
