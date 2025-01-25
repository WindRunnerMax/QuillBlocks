import { Trigger } from "@arco-design/web-react";
import { NIL } from "block-kit-utils";
import { useRef } from "react";

import { HEADING_KEY } from "../../heading/types";
import { useToolbarContext } from "../context/provider";

export const Heading = () => {
  const triggerRef = useRef<Trigger>(null);
  const { keys, refreshMarks, editor } = useToolbarContext();

  return (
    <Trigger
      ref={triggerRef}
      trigger="click"
      popup={() => (
        <div
          className="block-kit-toolbar-dropdown"
          onClick={() => {
            refreshMarks();
            triggerRef.current?.setPopupVisible(false);
          }}
        >
          <div onClick={() => editor.command.exec(HEADING_KEY, { value: NIL })}>Text</div>
          <div onClick={() => editor.command.exec(HEADING_KEY, { value: "h1" })}>H1</div>
          <div onClick={() => editor.command.exec(HEADING_KEY, { value: "h2" })}>H2</div>
          <div onClick={() => editor.command.exec(HEADING_KEY, { value: "h3" })}>H3</div>
        </div>
      )}
    >
      <div className="menu-toolbar-item" style={{ width: 20, textAlign: "center" }}>
        {keys[HEADING_KEY]?.toUpperCase() || "Text"}
      </div>
    </Trigger>
  );
};
