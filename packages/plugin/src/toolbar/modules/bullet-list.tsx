import { IconUnorderedList } from "@arco-design/web-react/icon";
import { cs, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { BULLET_LIST_KEY } from "../../bullet-list/types";
import { isBulletList } from "../../bullet-list/utils/is";
import { useToolbarContext } from "../context/provider";

export const BulletList: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  const isBullet = isBulletList(keys);

  return (
    <div
      className={cs("menu-toolbar-item", isBullet && "active")}
      onClick={() => {
        editor.command.exec(BULLET_LIST_KEY, { value: TRULY });
        refreshMarks();
      }}
    >
      <IconUnorderedList />
    </div>
  );
};
