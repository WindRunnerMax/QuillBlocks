import { IconItalic } from "@arco-design/web-react/icon";
import { cs, NIL, TRUE } from "block-kit-utils";

import { ITALIC_KEY } from "../../italic/types";
import { useToolbarContext } from "../context/provider";

export const Italic = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[ITALIC_KEY] && "active")}
      onClick={() => {
        editor.command.exec(ITALIC_KEY, { value: keys[ITALIC_KEY] ? NIL : TRUE });
        refreshMarks();
      }}
    >
      <IconItalic />
    </div>
  );
};
