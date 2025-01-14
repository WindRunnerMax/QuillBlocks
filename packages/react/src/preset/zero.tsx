import {
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
  /** embed(inline-block) 嵌入节点 */
  embed?: boolean;
  /** 行末尾占位 */
  enter?: boolean;
};

/**
 * 零宽字符组件
 * @param props
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
      }}
      style={props.hide ? NO_CURSOR : void 0}
    >
      {ZERO_SYMBOL}
    </span>
  );
});
