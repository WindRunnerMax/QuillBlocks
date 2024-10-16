import { LEAF_KEY, VOID_KEY } from "block-kit-core";
import { forwardRef } from "react";

import { ZeroSpace } from "./zero";

export type VoidProps = {
  className?: string;
};

export const Void = forwardRef<HTMLSpanElement, VoidProps>((props, ref) => {
  return (
    <span
      ref={ref}
      className={props.className}
      style={{ userSelect: "none" }}
      contentEditable={false}
      {...{ [VOID_KEY]: true, [LEAF_KEY]: true }}
    >
      <ZeroSpace />
      {props.children}
    </span>
  );
});
