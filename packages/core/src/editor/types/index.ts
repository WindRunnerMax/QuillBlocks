import type { Delta } from "block-kit-delta";
import type { O } from "block-kit-utils/dist/es/types";

import type { LOG_LEVEL } from "../../log";
import type { EditorSchema } from "../../schema/types";

export type EditorOptions = {
  /** 初始渲染数据 */
  delta?: Delta;
  /** 预设渲染规则 */
  schema?: EditorSchema;
  /** 日志等级 */
  logLevel?: O.Values<typeof LOG_LEVEL>;
};
