import { ZERO_SPACE_KEY, ZERO_SYMBOL } from "block-kit-core";
import { forwardRef } from "react";

export type ZeroSpaceProps = {
  breaking?: boolean;
};

export const ZeroSpace = forwardRef<HTMLSpanElement, ZeroSpaceProps>((props, ref) => {
  return (
    <span ref={ref} {...{ [ZERO_SPACE_KEY]: true }}>
      {ZERO_SYMBOL}
    </span>
  );
});
