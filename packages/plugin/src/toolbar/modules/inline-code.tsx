import { IconCode } from "@arco-design/web-react/icon";
import { cs, NIL, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { INLINE_CODE } from "../../inline-code/types";
import { useToolbarContext } from "../context/store";

export const InlineCode: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[INLINE_CODE] && "active")}
      onClick={() => {
        editor.command.exec(INLINE_CODE, { value: keys[INLINE_CODE] ? NIL : TRULY });
        refreshMarks();
      }}
    >
      <IconCode />
    </div>
  );
};
