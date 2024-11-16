import "./styles/index.scss";

import { IconBold } from "@arco-design/web-react/icon";
import type { Editor } from "block-kit-core";
import { cs, TRUE } from "block-kit-utils";
import type { FC } from "react";
import { useState } from "react";

import { BOLD_KEY } from "../bold/types";
import { toggleMark } from "./utils/marks";

export const MenuToolbar: FC<{
  editor: Editor;
}> = () => {
  const [keys, setKeys] = useState<Record<string, string>>({});

  return (
    <div className="menu-toolbar">
      <div
        className={cs("menu-toolbar-item", keys[BOLD_KEY] && "active")}
        onClick={() => {
          setKeys(toggleMark(BOLD_KEY, TRUE, keys));
        }}
      >
        <IconBold />
      </div>
    </div>
  );
};
