import { IconBold } from "@arco-design/web-react/icon";
import { cs, NIL, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { BOLD_KEY } from "../../bold/types";
import { useToolbarContext } from "../context/provider";

export const Bold: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[BOLD_KEY] && "active")}
      onClick={() => {
        editor.command.exec(BOLD_KEY, { value: keys[BOLD_KEY] ? NIL : TRULY });
        refreshMarks();
      }}
    >
      <IconBold />
    </div>
  );
};
