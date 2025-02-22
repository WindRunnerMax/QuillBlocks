import { CorePlugin } from "block-kit-core";

import type {
  ReactLeafContext,
  ReactLineContext,
  ReactWrapLeafContext,
  ReactWrapLineContext,
} from "./types";

export abstract class EditorPlugin extends CorePlugin {
  /**
   * 渲染包装行节点的 key
   */
  public wrapLineKeys?: string[];
  /**
   * 渲染包装叶子节点的 key
   */
  public wrapLeafKeys?: string[];
  /**
   * 包装行节点的调度优先级
   * - 非装饰器模式的实现
   */
  public __PRIORITY__wrapLine?: number;
  /**
   * 包装叶子节点的调度优先级
   * - 非装饰器模式的实现
   */
  public __PRIORITY__wrapLeaf?: number;
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
