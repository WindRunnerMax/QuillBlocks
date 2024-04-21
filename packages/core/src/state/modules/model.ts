import type { BlockState } from "./block";

export class Model {
  public readonly BLOCK_TO_DOM = new WeakMap<BlockState, HTMLElement>();
  public readonly DOM_TO_BLOCK = new WeakMap<HTMLElement, BlockState>();

  public getDOM(block: BlockState) {
    return this.BLOCK_TO_DOM.get(block);
  }

  public getBlock(dom: HTMLElement) {
    return this.DOM_TO_BLOCK.get(dom);
  }

  public setBlockModel(block: BlockState, dom: HTMLElement) {
    this.BLOCK_TO_DOM.set(block, dom);
    this.DOM_TO_BLOCK.set(dom, block);
  }
}
