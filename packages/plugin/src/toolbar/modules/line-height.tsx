import "../styles/line-height.scss";

import { Trigger } from "@arco-design/web-react";
import { IconCheck, IconDown } from "@arco-design/web-react/icon";
import { NIL } from "block-kit-utils";
import type { FC } from "react";

import { LINE_HEIGHT_KEY } from "../../line-height/types";
import { LineHeightIcon } from "../../shared/icons/line-height";
import { useToolbarContext } from "../context/provider";

const STEP = [...Array.from({ length: 11 }, (_, i) => i * 0.1 + 1.5), 3].map(v =>
  v.toFixed(1).toString()
);

export const LineHeight: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <Trigger
      trigger="click"
      popup={() => (
        <div className="block-kit-toolbar-dropdown" onClick={refreshMarks}>
          <div
            className="block-kit-toolbar-height-item kit-toolbar-node"
            onClick={() => editor.command.exec(LINE_HEIGHT_KEY, { value: NIL })}
          >
            {!keys[LINE_HEIGHT_KEY] && <IconCheck />}
            默认
          </div>
          {STEP.map(item => (
            <div
              key={item}
              className="block-kit-toolbar-height-item kit-toolbar-node"
              onClick={() => editor.command.exec(LINE_HEIGHT_KEY, { value: item })}
            >
              {keys[LINE_HEIGHT_KEY] === item && <IconCheck />}
              {item}
            </div>
          ))}
        </div>
      )}
    >
      <div className="menu-toolbar-item">
        <LineHeightIcon></LineHeightIcon>
        <IconDown className="menu-toolbar-icon-down" />
      </div>
    </Trigger>
  );
};
