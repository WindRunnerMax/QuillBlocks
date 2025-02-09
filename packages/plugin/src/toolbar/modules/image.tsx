import { IconImage } from "@arco-design/web-react/icon";
import { cs, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { IMAGE_KEY } from "../../image/types";
import { useToolbarContext } from "../context/provider";

export const Image: FC = () => {
  const { refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item")}
      onClick={() => {
        editor.command.exec(IMAGE_KEY, { value: TRULY });
        refreshMarks();
      }}
    >
      <IconImage />
    </div>
  );
};
