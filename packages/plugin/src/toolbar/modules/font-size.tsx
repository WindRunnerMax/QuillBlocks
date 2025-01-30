import { Trigger } from "@arco-design/web-react";
import { IconCheck, IconDown } from "@arco-design/web-react/icon";
import { NIL } from "block-kit-utils";
import type { FC } from "react";
import { useRef } from "react";

import { FONT_SIZE_KEY } from "../../font-size/types";
import { FontSizeIcon } from "../../shared/icons/font-size";
import { useToolbarContext } from "../context/provider";

const STEP = Array(10)
  .fill(null)
  .map((_, i) => String(i + 12));

export const FontSize: FC = () => {
  const triggerRef = useRef<Trigger>(null);
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <Trigger
      ref={triggerRef}
      trigger="click"
      popup={() => (
        <div className="block-kit-toolbar-dropdown" onClick={refreshMarks}>
          <div
            className="block-kit-toolbar-height-item kit-toolbar-node"
            onClick={() => editor.command.exec(FONT_SIZE_KEY, { value: NIL })}
          >
            {!keys[FONT_SIZE_KEY] && <IconCheck />}
            默认
          </div>
          {STEP.map(item => (
            <div
              key={item}
              className="block-kit-toolbar-height-item kit-toolbar-node"
              onClick={() => editor.command.exec(FONT_SIZE_KEY, { value: item })}
            >
              {keys[FONT_SIZE_KEY] === item && <IconCheck />}
              {item}
            </div>
          ))}
        </div>
      )}
    >
      <div className="menu-toolbar-item">
        <FontSizeIcon></FontSizeIcon>
        <IconDown className="menu-toolbar-icon-down" />
      </div>
    </Trigger>
  );
};
