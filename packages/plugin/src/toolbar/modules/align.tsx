import { Trigger } from "@arco-design/web-react";
import {
  IconAlignCenter,
  IconAlignLeft,
  IconAlignRight,
  IconDown,
} from "@arco-design/web-react/icon";
import { NIL } from "block-kit-utils";
import type { O } from "block-kit-utils/dist/es/types";
import type { FC } from "react";

import { ALIGN_KEY } from "../../align/types";
import { JustifyIcon } from "../../shared/icons/justify";
import { useToolbarContext } from "../context/provider";

const MAP: O.Map<JSX.Element> = {
  left: <IconAlignLeft />,
  center: <IconAlignCenter />,
  right: <IconAlignRight />,
  justify: <JustifyIcon />,
};

export const Align: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <Trigger
      trigger="click"
      popup={() => (
        <div className="block-kit-toolbar-dropdown" onClick={refreshMarks}>
          <div
            className="kit-toolbar-node"
            onClick={() => editor.command.exec(ALIGN_KEY, { value: NIL })}
          >
            <IconAlignLeft />
          </div>
          <div
            className="kit-toolbar-node"
            onClick={() => editor.command.exec(ALIGN_KEY, { value: "center" })}
          >
            <IconAlignCenter />
          </div>
          <div
            className="kit-toolbar-node"
            onClick={() => editor.command.exec(ALIGN_KEY, { value: "right" })}
          >
            <IconAlignRight />
          </div>
          <div
            className="kit-toolbar-node"
            onClick={() => editor.command.exec(ALIGN_KEY, { value: "justify" })}
          >
            <JustifyIcon />
          </div>
        </div>
      )}
    >
      <div className="menu-toolbar-item">
        {MAP[keys[ALIGN_KEY]] || <IconAlignLeft />}
        <IconDown className="menu-toolbar-icon-down" />
      </div>
    </Trigger>
  );
};
