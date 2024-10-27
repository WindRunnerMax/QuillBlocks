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
  hide?: boolean;
  void?: boolean;
  embed?: boolean;
  enter?: boolean;
};

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
