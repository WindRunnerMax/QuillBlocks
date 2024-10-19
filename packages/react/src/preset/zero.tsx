import { ZERO_SPACE_KEY, ZERO_SYMBOL } from "block-kit-core";
import React, { forwardRef } from "react";

export type ZeroSpaceProps = {
  breaking?: boolean;
  style?: React.CSSProperties;
};

export const ZeroSpace = forwardRef<HTMLSpanElement, ZeroSpaceProps>((props, ref) => {
  return (
    <span ref={ref} {...{ [ZERO_SPACE_KEY]: true }} style={props.style}>
      {ZERO_SYMBOL}
    </span>
  );
});
