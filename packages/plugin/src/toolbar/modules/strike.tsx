import { IconStrikethrough } from "@arco-design/web-react/icon";
import { cs, NIL, TRUE } from "block-kit-utils";

import { STRIKE_KEY } from "../../strike/types";
import { useToolbarContext } from "../context/provider";

export const Strike = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[STRIKE_KEY] && "active")}
      onClick={() => {
        editor.command.exec(STRIKE_KEY, { value: keys[STRIKE_KEY] ? NIL : TRUE });
        refreshMarks();
      }}
    >
      <IconStrikethrough />
    </div>
  );
};
