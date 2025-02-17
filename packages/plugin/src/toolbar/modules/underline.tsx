import { IconUnderline } from "@arco-design/web-react/icon";
import { cs, NIL, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { UNDERLINE_KEY } from "../../underline/types";
import { useToolbarContext } from "../context/store";

export const Underline: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[UNDERLINE_KEY] && "active")}
      onClick={() => {
        editor.command.exec(UNDERLINE_KEY, { value: keys[UNDERLINE_KEY] ? NIL : TRULY });
        refreshMarks();
      }}
    >
      <IconUnderline />
    </div>
  );
};
