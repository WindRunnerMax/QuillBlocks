import type { AttributeMap } from "block-kit-delta";
import { EditorPlugin, Void } from "block-kit-react";
import type { ReactNode } from "react";

import { IMAGE_KEY } from "./types";

export class ImagePlugin extends EditorPlugin {
  public key = IMAGE_KEY;
  public destroy(): void {}

  public match(attrs: AttributeMap): boolean {
    return !!attrs[IMAGE_KEY];
  }

  public render(): ReactNode {
    return (
      <Void>
        <img src="https://windrunnermax.github.io/DocEditor/favicon.ico"></img>
      </Void>
    );
  }
}
