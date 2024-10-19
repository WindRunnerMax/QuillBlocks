import { VOID_KEY } from "block-kit-core";
import type { PropsWithChildren } from "react";
import { forwardRef } from "react";
import React from "react";

import { ZeroSpace } from "./zero";

export type VoidProps = PropsWithChildren<{
  className?: string;
}>;

export const Void = forwardRef<HTMLSpanElement, VoidProps>((props, ref) => {
  return (
    <React.Fragment>
      <ZeroSpace style={{ position: "absolute", width: 0, height: 0, display: "inline-block" }} />
      <span
        ref={ref}
        className={props.className}
        style={{ userSelect: "none" }}
        contentEditable={false}
        {...{ [VOID_KEY]: true }}
      >
        {props.children}
        <ZeroSpace style={{ position: "absolute", width: 0, height: 0, display: "inline-block" }} />
      </span>
    </React.Fragment>
  );
});
