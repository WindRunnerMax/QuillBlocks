import { IconStrikethrough } from "@arco-design/web-react/icon";
import { cs, NIL, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { STRIKE_KEY } from "../../strike/types";
import { useToolbarContext } from "../context/store";

export const Strike: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[STRIKE_KEY] && "active")}
      onClick={() => {
        editor.command.exec(STRIKE_KEY, { value: keys[STRIKE_KEY] ? NIL : TRULY });
        refreshMarks();
      }}
    >
      <IconStrikethrough />
    </div>
  );
};
