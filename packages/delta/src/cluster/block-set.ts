import { isString } from "block-kit-utils";

import { BlockDelta } from "./block-delta";
import type { BlockSetOption } from "./interface";

export class BlockSet {
  protected _blocks: Record<string, BlockDelta>;

  constructor(blocks: BlockSetOption = {}) {
    this._blocks = Object.keys(blocks).reduce(
      (acc, blockId) => ({ ...acc, [blockId]: new BlockDelta(blocks[blockId]) }),
      {} as Record<string, BlockDelta>
    );
  }

  /**
   * 获取块集合
   */
  public get blocks() {
    return this._blocks;
  }

  /**
   * 获取指定块
   * @param blockId
   */
  public get(blockId: string): BlockDelta | null {
    return this._blocks[blockId] || null;
  }

  /**
   * 删除指定块
   * @param blockId
   */
  public delete(blockId: string): this {
    delete this._blocks[blockId];
    return this;
  }

  /**
   * 增加块
   * @param params
   */
  public add(params: BlockDelta): this;
  public add(params: string, blockDelta: BlockDelta): this;
  public add(params: BlockDelta | string, blockDelta?: BlockDelta): this {
    if (isString(params)) {
      const delta = blockDelta;
      if (!delta) {
        console.error("BlockDelta is not defined:", params);
        return this;
      }
      if (delta.blockId !== params) {
        console.error("BlockId is not equal:", params, delta.blockId);
        return this;
      }
      this._blocks[params] = delta;
    } else {
      this._blocks[params.blockId] = params;
    }
    return this;
  }

  /**
   * 替换块
   * @param blockId 被替换的块
   * @param blockDelta 替换的块
   */
  public replace(blockId: string, blockDelta: BlockDelta): this {
    return this.delete(blockId).add(blockDelta.blockId, blockDelta);
  }

  /**
   * 遍历块
   * @param cb
   */
  public forEach(cb: (blockId: string, blockDelta: BlockDelta) => void) {
    for (const [blockId, blockDelta] of Object.entries(this._blocks)) {
      cb(blockId, blockDelta);
    }
  }

  /**
   * 克隆对象
   * @param deep 是否深拷贝
   */
  public clone(deep?: boolean): BlockSet {
    const newBlockSet = new BlockSet();
    this.forEach((blockId, delta) => {
      newBlockSet.add(blockId, delta.clone(deep));
    });
    return newBlockSet;
  }
}
