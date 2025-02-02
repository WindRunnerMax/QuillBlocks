import { IconOrderedList } from "@arco-design/web-react/icon";
import { cs, NIL, TRUE } from "block-kit-utils";
import type { FC } from "react";

import { ORDER_LIST_KEY } from "../../order-list/types";
import { useToolbarContext } from "../context/provider";

export const OrderList: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <div
      className={cs("menu-toolbar-item", keys[ORDER_LIST_KEY] && "active")}
      onClick={() => {
        editor.command.exec(ORDER_LIST_KEY, { value: keys[ORDER_LIST_KEY] ? NIL : TRUE });
        refreshMarks();
      }}
    >
      <IconOrderedList />
    </div>
  );
};
