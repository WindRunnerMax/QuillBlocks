import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { Void } from "block-kit-react";
import type { ReactNode } from "react";

import { SelectionHOC } from "../shared/components/selection";
import { SelectionPlugin } from "../shared/modules/selection";
import { IMAGE_KEY } from "./types";

export class ImagePlugin extends SelectionPlugin {
  public key = IMAGE_KEY;

  constructor(editor: Editor, readonly: boolean) {
    super(editor, readonly);
  }

  public destroy(): void {
    super.destroy();
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[IMAGE_KEY];
  }

  public render(context: ReactLeafContext): ReactNode {
    return (
      <Void style={{ display: "inline-block" }}>
        <SelectionHOC selection={this} leaf={context.leafState}>
          <img
            src="https://windrunnermax.github.io/DocEditor/favicon.ico"
            width={200}
            height={200}
          ></img>
        </SelectionHOC>
      </Void>
    );
  }
}
