import { IconOrderedList } from "@arco-design/web-react/icon";
import { cs, TRULY } from "block-kit-utils";
import type { FC } from "react";

import { ORDER_LIST_KEY } from "../../order-list/types";
import { isOrderList } from "../../order-list/utils/is";
import { useToolbarContext } from "../context/store";

export const OrderList: FC = () => {
  const { keys, refreshMarks, editor } = useToolbarContext();

  const isOrder = isOrderList(keys);

  return (
    <div
      className={cs("menu-toolbar-item", isOrder && "active")}
      onClick={() => {
        editor.command.exec(ORDER_LIST_KEY, { value: TRULY });
        refreshMarks();
      }}
    >
      <IconOrderedList />
    </div>
  );
};
