import { ZERO_ENTER_KEY, ZERO_SPACE_KEY, ZERO_SYMBOL, ZERO_VOID_KEY } from "block-kit-core";
import React, { forwardRef } from "react";

export const NO_CURSOR = {
  position: "absolute",
  width: 0,
  height: 0,
  display: "inline-block",
} as const;

export type ZeroSpaceProps = {
  hide?: boolean;
  void?: boolean;
  enter?: boolean;
};

export const ZeroSpace = forwardRef<HTMLSpanElement, ZeroSpaceProps>((props, ref) => {
  return (
    <span
      ref={ref}
      {...{ [ZERO_SPACE_KEY]: true, [ZERO_VOID_KEY]: props.void, [ZERO_ENTER_KEY]: props.enter }}
      style={props.hide ? NO_CURSOR : void 0}
    >
      {ZERO_SYMBOL}
    </span>
  );
});
