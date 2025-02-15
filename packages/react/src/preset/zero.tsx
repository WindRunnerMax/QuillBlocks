import {
  VOID_LEN_KEY,
  ZERO_EMBED_KEY,
  ZERO_ENTER_KEY,
  ZERO_SPACE_KEY,
  ZERO_SYMBOL,
  ZERO_VOID_KEY,
} from "block-kit-core";
import { forwardRef } from "react";

import { NO_CURSOR } from "../utils/constant";

export type ZeroSpaceProps = {
  /** 隐藏光标 */
  hide?: boolean;
  /** void-block 空节点 */
  void?: boolean;
  /** inline-block embed 嵌入节点 */
  embed?: boolean;
  /** 行末尾占位 */
  enter?: boolean;
  /** 空节点占位长度 */
  len?: number;
};

/**
 * 零宽字符组件
 * - void hide => 独占一行的空节点, 例如 Image
 * - embed => 嵌入节点, 例如 Mention
 * - enter => 行末尾占位, 保留于 EOLView
 * - len => 空节点占位长度, 配合 Void/Embed
 * @param props
 * @param ref
 */
export const ZeroSpace = forwardRef<HTMLSpanElement, ZeroSpaceProps>((props, ref) => {
  return (
    <span
      ref={ref}
      {...{
        [ZERO_SPACE_KEY]: true,
        [ZERO_VOID_KEY]: props.void,
        [ZERO_ENTER_KEY]: props.enter,
        [ZERO_EMBED_KEY]: props.embed,
        [VOID_LEN_KEY]: props.len,
      }}
      style={props.hide ? NO_CURSOR : void 0}
    >
      {ZERO_SYMBOL}
    </span>
  );
});
