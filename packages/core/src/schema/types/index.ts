export type SchemaRule = {
  /**
   * 块级节点
   * block + void: 独占一行的 Void 节点
   */
  block?: boolean;
  /**
   * 行内节点
   * inline + mark: 不追踪末尾 Mark
   * inline + void: 行内 Void 节点 = Embed
   */
  inline?: boolean;
  /**
   * 空节点
   * void: 独立且不可编辑的节点
   * void + block: 独占一行的 Void 节点
   * void + inline: 行内 Void 节点 = Embed
   */
  void?: boolean;
  /**
   * Mark
   * mark: 输入时会自动追踪样式的节点
   * mark + inline: 不追踪末尾 Mark
   */
  mark?: boolean;
};

export type EditorSchema = Record<string, SchemaRule>;
