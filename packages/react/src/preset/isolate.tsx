import type { FC, PropsWithChildren } from "react";
import React from "react";

import { preventReactEvent } from "../utils/event";

export type IsolateProps = PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
}>;

/**
 * 独立节点嵌入 HOC
 * - 独立区域 完全隔离所有事件
 * @param props
 */
export const Isolate: FC<IsolateProps> = props => {
  return (
    <span
      className={props.className}
      style={{ userSelect: "none", ...props.style }}
      contentEditable={false}
      onMouseDown={preventReactEvent}
      onCopy={preventReactEvent}
    >
      {props.children}
    </span>
  );
};
