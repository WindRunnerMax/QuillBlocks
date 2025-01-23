import type { BlockState } from "../state/modules/block-state";
import type { LeafState } from "../state/modules/leaf-state";
import type { LineState } from "../state/modules/line-state";

export class Model {
  /** DOM TO STATE */
  protected DOM_MODEL: WeakMap<HTMLElement, BlockState | LineState | LeafState>;
  /** STATE TO DOM */
  protected MODEL_DOM: WeakMap<BlockState | LineState | LeafState, HTMLElement>;

  /**
   * 构造函数
   */
  constructor() {
    this.DOM_MODEL = new WeakMap();
    this.MODEL_DOM = new WeakMap();
  }

  /**
   * 销毁模块
   */
  public destroy() {
    this.DOM_MODEL = new WeakMap();
    this.MODEL_DOM = new WeakMap();
  }

  /**
   * 映射 DOM - BlockState
   * @param node
   * @param state
   */
  public setBlockModel(node: HTMLDivElement, state: BlockState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }

  /**
   * 获取 Block State
   * @param node
   */
  public getBlockState(node: HTMLElement | null): BlockState | null {
    if (!node) return null;
    return <BlockState>this.DOM_MODEL.get(node) || null;
  }

  /**
   * 获取 Block DOM
   * @param state
   */
  public getBlockNode(state: BlockState | null): HTMLDivElement | null {
    if (!state) return null;
    return <HTMLDivElement>this.MODEL_DOM.get(state) || null;
  }

  /**
   * 映射 DOM - LineState
   * @param node
   * @param state
   */
  public setLineModel(node: HTMLDivElement, state: LineState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }

  /**
   * 获取 Line State
   * @param node
   */
  public getLineState(node: HTMLElement | null): LineState | null {
    if (!node) return null;
    return <LineState>this.DOM_MODEL.get(node) || null;
  }

  /**
   * 获取 Line DOM
   * @param state
   */
  public getLineNode(state: LineState | null): HTMLDivElement | null {
    if (!state) return null;
    return <HTMLDivElement>this.MODEL_DOM.get(state) || null;
  }

  /**
   * 映射 DOM - LeafState
   * @param node
   * @param state
   */
  public setLeafModel(node: HTMLSpanElement, state: LeafState) {
    this.DOM_MODEL.set(node, state);
    this.MODEL_DOM.set(state, node);
  }

  /**
   * 获取 Leaf State
   * @param node
   */
  public getLeafState(node: HTMLElement | null): LeafState | null {
    if (!node) return null;
    return <LeafState>this.DOM_MODEL.get(node) || null;
  }

  /**
   * 获取 Leaf DOM
   * @param state
   */
  public getLeafNode(state: LeafState | null): HTMLSpanElement | null {
    if (!state) return null;
    return <HTMLSpanElement>this.MODEL_DOM.get(state) || null;
  }
}
