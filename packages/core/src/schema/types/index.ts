export type SchemaRule = {
  /**
   * 块级节点
   * - block: 独占一行的可编辑节点
   */
  block?: boolean;
  /**
   * 行内节点
   * - inline + mark: 不追踪末尾 Mark
   * - inline + void: 行内 Void 节点 => Embed
   */
  inline?: boolean;
  /**
   * 空节点
   * - void: 独占一行且不可编辑的节点
   * - void + inline: 行内 Void 节点 => Embed
   */
  void?: boolean;
  /**
   * Mark
   * - mark: 输入时会自动追踪样式的节点
   * - mark + inline: 不追踪末尾 Mark
   */
  mark?: boolean;
};

export type EditorSchema = Record<string, SchemaRule>;
