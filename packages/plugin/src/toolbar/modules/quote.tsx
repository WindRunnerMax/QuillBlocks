import { IconQuote } from "@arco-design/web-react/icon";
import { cs, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { QUOTE_KEY } from "../../quote/types";
import { useToolbarContext } from "../context/store";

export const Quote: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[QUOTE_KEY] && "active")}
      onClick={() => {
        editor.command.exec(QUOTE_KEY, { value: TRULY });
        refreshMarks();
      }}
    >
      <IconQuote />
    </div>
  );
};
