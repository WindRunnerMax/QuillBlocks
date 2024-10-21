import type { Editor } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { Void } from "block-kit-react";
import { EditorPlugin } from "block-kit-react";
import type { ReactNode } from "react";

import { SelectionHOC } from "../shared/components/selection";
import { SelectionPlugin } from "../shared/modules/selection";
import { IMAGE_KEY } from "./types";

export class ImagePlugin extends EditorPlugin {
  public key = IMAGE_KEY;
  public selection: SelectionPlugin;

  constructor(editor: Editor, readonly: boolean) {
    super();
    this.selection = new SelectionPlugin(editor, readonly);
  }

  public destroy(): void {
    this.selection.destroy();
  }

  public match(attrs: AttributeMap): boolean {
    return !!attrs[IMAGE_KEY];
  }

  public render(context: ReactLeafContext): ReactNode {
    return (
      <Void style={{ display: "inline-block" }}>
        <SelectionHOC selection={this.selection} leaf={context.leafState}>
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
