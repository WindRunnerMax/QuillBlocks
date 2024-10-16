import type { Object } from "block-kit-utils";

export const NODE_TO_KEY = new WeakMap<Object.Any, Key>();

export class Key {
  /** 当前节点 id */
  public id: string;
  /** 自动递增标识符 */
  public static n = 0;

  constructor() {
    this.id = `${Key.n++}`;
  }

  /**
   * 根据节点获取 id
   * @param node
   */
  public static getId(node: Object.Any): string {
    let key = NODE_TO_KEY.get(node);
    if (!key) {
      key = new Key();
      NODE_TO_KEY.set(node, key);
    }
    return key.id;
  }

  /**
   * 根据节点刷新 id
   * @param node
   */
  public static refresh(node: Object.Any): string {
    const key = new Key();
    NODE_TO_KEY.set(node, key);
    return key.id;
  }

  /**
   * 刷新 Key id
   * @param node
   * @param id
   */
  public static update(node: Object.Any, id: string): string {
    const key = NODE_TO_KEY.get(node);
    if (key) {
      key.id = id;
    }
    return id;
  }
}
