import "../styles/index.scss";

import type { Editor } from "block-kit-core";
import type { ReactLineContext } from "block-kit-react";
import { cs, preventNativeEvent } from "block-kit-utils";
import type { FC } from "react";

import { formatListLevel } from "../utils/format";

export const OrderListView: FC<{
  context: ReactLineContext;
  editor: Editor;
  level: number;
  start: number;
}> = props => {
  const { level, start, children } = props;

  return (
    <ol className="block-kit-order-list">
      <div
        contentEditable={false}
        className="block-kit-order-indicator"
        onMouseDown={preventNativeEvent}
      >
        {formatListLevel(start, level)}
      </div>
      <li value={start} className={cs("block-kit-order-item", `block-kit-li-level-${level % 3}`)}>
        {children}
      </li>
    </ol>
  );
};
