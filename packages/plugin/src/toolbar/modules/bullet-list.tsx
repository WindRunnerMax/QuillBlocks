import { IconUnorderedList } from "@arco-design/web-react/icon";
import { cs, NIL, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { BULLET_LIST_KEY } from "../../bullet-list/types";
import { useToolbarContext } from "../context/provider";

export const BulletList: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[BULLET_LIST_KEY] && "active")}
      onClick={() => {
        editor.command.exec(BULLET_LIST_KEY, { value: keys[BULLET_LIST_KEY] ? NIL : TRULY });
        refreshMarks();
      }}
    >
      <IconUnorderedList />
    </div>
  );
};
