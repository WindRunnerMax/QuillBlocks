import { CorePlugin } from "block-kit-core";

import type {
  ReactLeafContext,
  ReactLineContext,
  ReactWrapLeafContext,
  ReactWrapLineContext,
} from "./types";

export abstract class EditorPlugin extends CorePlugin {
  /**
   * 渲染包装行节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public wrapLine?(children: ReactWrapLineContext): React.ReactNode;
  /**
   * 渲染包装叶子节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public wrapLeaf?(context: ReactWrapLeafContext): React.ReactNode;
  /**
   * 渲染行节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderLine?(context: ReactLineContext): React.ReactNode;
  /**
   * 渲染块级子节点
   * - 调度优先级值越大 DOM 结构在越外层
   */
  public renderLeaf?(context: ReactLeafContext): React.ReactNode;
}
