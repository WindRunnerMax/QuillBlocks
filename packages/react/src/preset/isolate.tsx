import type { FC, PropsWithChildren } from "react";
import React from "react";

import { stopReactEvent } from "../utils/event";

export type IsolateProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
}>;

export const Isolate: FC<IsolateProps> = props => {
  return (
    <span
      className={props.className}
      style={{ userSelect: "none", ...props.style }}
      contentEditable={false}
      onMouseDown={stopReactEvent}
      onCopy={stopReactEvent}
    >
      {props.children}
    </span>
  );
};
