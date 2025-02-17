import { Trigger } from "@arco-design/web-react";
import { IconDown, IconH1, IconH2, IconH3 } from "@arco-design/web-react/icon";
import { NIL } from "block-kit-utils";
import type { O } from "block-kit-utils/dist/es/types";
import type { FC } from "react";

import { HEADING_KEY } from "../../heading/types";
import { TextIcon } from "../../shared/icons/text";
import { useToolbarContext } from "../context/store";

const MAP: O.Map<JSX.Element> = {
  h1: <IconH1 />,
  h2: <IconH2 />,
  h3: <IconH3 />,
};

export const Heading: FC = () => {
  const {
    keys,
    refreshMarks,
    editor: { command },
  } = useToolbarContext();

  return (
    <Trigger
      trigger="click"
      popupAlign={{ bottom: 10 }}
      popup={() => (
        <div className="block-kit-toolbar-dropdown" onClick={refreshMarks}>
          <div
            className="kit-toolbar-node"
            onClick={() => command.exec(HEADING_KEY, { value: NIL })}
          >
            <TextIcon />
          </div>
          <div
            className="kit-toolbar-node"
            onClick={() => command.exec(HEADING_KEY, { value: "h1" })}
          >
            <IconH1 />
          </div>
          <div
            className="kit-toolbar-node"
            onClick={() => command.exec(HEADING_KEY, { value: "h2" })}
          >
            <IconH2 />
          </div>
          <div
            className="kit-toolbar-node"
            onClick={() => command.exec(HEADING_KEY, { value: "h3" })}
          >
            <IconH3 />
          </div>
        </div>
      )}
    >
      <div className="menu-toolbar-item">
        {MAP[keys[HEADING_KEY]] || <TextIcon />}
        <IconDown className="menu-toolbar-icon-down" />
      </div>
    </Trigger>
  );
};
