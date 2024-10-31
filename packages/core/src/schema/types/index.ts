export type SchemaRule = {
  /** 块级节点 */
  block?: boolean;
  /** 行内块节点 */
  inline?: boolean;
  /** 空节点 */
  void?: boolean;
  /** Mark */
  mark?: boolean;
  /** 不追踪末尾 Mark */
  notTailMark?: boolean;
};

export type EditorSchema = Record<string, SchemaRule>;
