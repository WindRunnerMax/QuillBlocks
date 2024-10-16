import type { BlockState } from "../state/modules/block-state";
import type { LeafState } from "../state/modules/leaf-state";
import type { LineState } from "../state/modules/line-state";

export class Model {
  private DOM_MODEL = new WeakMap<HTMLElement, BlockState | LineState | LeafState>();
  private MODEL_DOM = new WeakMap<BlockState | LineState | LeafState, HTMLElement>();

  public setBlockModel(node: HTMLDivElement, state: BlockState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }

  public getBlockState(node: HTMLElement | null): BlockState | null {
    if (!node) return null;
    return <BlockState>this.DOM_MODEL.get(node) || null;
  }

  public getBlockNode(state: BlockState | null): HTMLDivElement | null {
    if (!state) return null;
    return <HTMLDivElement>this.MODEL_DOM.get(state) || null;
  }

  public setLineModel(node: HTMLDivElement, state: LineState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }

  public getLineState(node: HTMLElement | null): LineState | null {
    if (!node) return null;
    return <LineState>this.DOM_MODEL.get(node) || null;
  }

  public getLineNode(state: LineState | null): HTMLDivElement | null {
    if (!state) return null;
    return <HTMLDivElement>this.MODEL_DOM.get(state) || null;
  }

  public setLeafModel(node: HTMLSpanElement, state: LeafState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }

  public getLeafState(node: HTMLElement | null): LeafState | null {
    if (!node) return null;
    return <LeafState>this.DOM_MODEL.get(node) || null;
  }

  public getLeafNode(state: LeafState | null): HTMLSpanElement | null {
    if (!state) return null;
    return <HTMLSpanElement>this.MODEL_DOM.get(state) || null;
  }

  destroy() {
    this.DOM_MODEL = new WeakMap();
    this.MODEL_DOM = new WeakMap();
  }
}
