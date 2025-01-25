import { IconUnderline } from "@arco-design/web-react/icon";
import { cs, NIL, TRUE } from "block-kit-utils";

import { UNDERLINE_KEY } from "../../underline/types";
import { useToolbarContext } from "../context/provider";

export const Underline = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[UNDERLINE_KEY] && "active")}
      onClick={() => {
        editor.command.exec(UNDERLINE_KEY, { value: keys[UNDERLINE_KEY] ? NIL : TRUE });
        refreshMarks();
      }}
    >
      <IconUnderline />
    </div>
  );
};
