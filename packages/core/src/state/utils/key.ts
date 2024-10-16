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
}
