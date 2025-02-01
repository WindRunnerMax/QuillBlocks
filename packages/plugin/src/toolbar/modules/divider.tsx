import { cs, TRUE } from "block-kit-utils";
import type { FC } from "react";

import { DIVIDER_KEY } from "../../divider/types";
import { DividerIcon } from "../../shared/icons/divider";
import { useToolbarContext } from "../context/provider";

export const Divider: FC = () => {
  const { refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item")}
      onClick={() => {
        editor.command.exec(DIVIDER_KEY, { value: TRUE });
        refreshMarks();
      }}
    >
      <DividerIcon />
    </div>
  );
};
