import type { AttributeMap, Op } from "block-kit-delta";
import type { P } from "block-kit-utils/dist/es/types";

import type { CopyContext, PasteContext, PasteNodesContext } from "../../clipboard/types";
import type { LeafContext, LineContext } from "../types/context";

export abstract class CorePlugin {
  /** 插件唯一标识 */
  public abstract readonly key: string;
  /** 调度优先级越高 DOM 结构在越外层 */
  public readonly priority?: number;
  /** 插件销毁时调度 */
  public abstract destroy(): void;
  /** 叶子节点匹配插件 */
  public abstract match(attrs: AttributeMap, op: Op): boolean;
  /** 渲染行节点 */
  public renderLine?(context: LineContext): P.Any;
  /** 渲染块级子节点 */
  public render?(context: LeafContext): P.Any;
  /** 将 Fragment 序列化为 HTML  */
  public serialize?(context: CopyContext): void;
  /** 将 HTML 反序列化为 Fragment  */
  public deserialize?(context: PasteContext): void;
  /** 内容即将写入剪贴板 */
  public willSetToClipboard?(context: CopyContext): void;
  /** 粘贴的内容即将应用到编辑器 */
  public willApplyPasteNodes?(context: PasteNodesContext): void;
}
