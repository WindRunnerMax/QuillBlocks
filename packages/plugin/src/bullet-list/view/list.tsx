import type { Editor } from "block-kit-core";
import type { ReactLineContext } from "block-kit-react";
import { cs } from "block-kit-utils";
import type { FC } from "react";

export const ListView: FC<{
  context: ReactLineContext;
  editor: Editor;
  level: number;
}> = props => {
  const { level, children } = props;

  return (
    <ul className="block-kit-bullet-list">
      <li className={cs("block-kit-bullet-item", `block-kit-li-level-${level % 3}`)}>{children}</li>
    </ul>
  );
};
