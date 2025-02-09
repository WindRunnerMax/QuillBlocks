import "../styles/index.scss";

import { IconLoading } from "@arco-design/web-react/icon";
import type { Editor } from "block-kit-core";
import { APPLY_SOURCE, RawRange } from "block-kit-core";
import type { AttributeMap } from "block-kit-delta";
import { Delta } from "block-kit-delta";
import type { ReactLeafContext } from "block-kit-react";
import { Void } from "block-kit-react";
import { Styles } from "block-kit-utils";
import type { FC } from "react";

import { SelectionHOC } from "../../shared/components/selection";
import type { SelectionPlugin } from "../../shared/modules/selection";
import {
  IMAGE_HEIGHT,
  IMAGE_SCALE,
  IMAGE_SRC,
  IMAGE_STATUS,
  IMAGE_WIDTH,
  LOADING_STATUS,
} from "../types";
import { ImageWrapper } from "./wrapper";

export const ImageView: FC<{
  selection: SelectionPlugin;
  context: ReactLeafContext;
  editor: Editor;
}> = props => {
  const { selection, context, editor } = props;

  const attrs = context.attributes || {};
  const src = attrs[IMAGE_SRC];
  const width = attrs[IMAGE_WIDTH];
  const height = attrs[IMAGE_HEIGHT];
  const status = attrs[IMAGE_STATUS];

  const onImageLoad: React.ReactEventHandler<HTMLImageElement> = event => {
    const target = event.target as HTMLImageElement;
    if (width && height) return void 0;
    const { naturalHeight, naturalWidth } = target;
    const scale = naturalHeight / naturalWidth;
    const next: AttributeMap = {
      [IMAGE_WIDTH]: String(naturalWidth),
      [IMAGE_HEIGHT]: String(naturalHeight),
      [IMAGE_SCALE]: String(scale),
    };
    const range = context.leafState.toRange();
    const rawRange = RawRange.fromRange(editor, range);
    if (!rawRange) return void 0;
    const delta = new Delta().retain(rawRange.start).retain(rawRange.len, next);
    editor.state.apply(delta, { source: APPLY_SOURCE.REMOTE, autoCaret: false });
  };

  return (
    <Void className="block-kit-image-container" context={context}>
      {status === LOADING_STATUS.LOADING && (
        <div className="block-kit-image-loading">
          <IconLoading />
        </div>
      )}
      <SelectionHOC selection={selection} leaf={context.leafState}>
        <ImageWrapper editor={props.editor} src={src} leaf={context.leafState}>
          <img
            className="block-kit-image"
            src={src}
            onLoad={onImageLoad}
            width={Styles.pixelate(width)}
            height={Styles.pixelate(height)}
          ></img>
        </ImageWrapper>
      </SelectionHOC>
    </Void>
  );
};
