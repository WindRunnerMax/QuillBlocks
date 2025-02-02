import { IconImage } from "@arco-design/web-react/icon";
import { cs, TRUE } from "block-kit-utils";
import type { FC } from "react";

import { DIVIDER_KEY } from "../../divider/types";
import { useToolbarContext } from "../context/provider";

export const Image: FC = () => {
  const { refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item")}
      onClick={() => {
        editor.command.exec(DIVIDER_KEY, { value: TRUE });
        refreshMarks();
      }}
    >
      <IconImage />
    </div>
  );
};
