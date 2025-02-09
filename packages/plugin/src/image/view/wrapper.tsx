import "../styles/wrapper.scss";

import { Image } from "@arco-design/web-react";
import type { Editor } from "block-kit-core";
import type { LeafState } from "block-kit-core";
import { RawRange } from "block-kit-core";
import { Delta } from "block-kit-delta";
import { useReadonly } from "block-kit-react";
import { cs } from "block-kit-utils";
import type { FC } from "react";
import React, { Fragment, useRef, useState } from "react";

import { IMAGE_HEIGHT, IMAGE_WIDTH } from "../types";

const Preview = Image.Preview;

export const ImageWrapper: FC<{
  selected?: boolean;
  src: string;
  editor: Editor;
  leaf: LeafState;
}> = props => {
  const { readonly } = useReadonly();
  const [src, setImage] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const enable = readonly || props.selected;

  const preview = (e: React.MouseEvent<HTMLDivElement>) => {
    // https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/button
    if (e.button !== 0) return;
    enable && setImage(props.src || "");
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const resider = e.target;
    const config = props.leaf.op.attributes || {};
    const width = config[IMAGE_WIDTH] || null;
    const height = config[IMAGE_HEIGHT] || null;
    e.stopPropagation();
    e.preventDefault();
    if (resider instanceof HTMLDivElement && resider.dataset.type && width && height) {
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = Number(width);
      const startHeight = Number(height);
      const ratio = startWidth / startHeight;
      const type = resider.dataset.type;
      const range = props.leaf.toRange();
      const raw = RawRange.fromRange(props.editor, range);
      if (!raw) return;
      const onMouseMove = (event: MouseEvent) => {
        const currentX = event.clientX;
        const currentY = event.clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;
        let nextWidth = startWidth;
        let nextHeight = startHeight;
        switch (type) {
          case "lt":
            nextWidth = nextWidth - diffX;
            nextHeight = nextHeight - diffY;
            break;
          case "rt":
            nextWidth = nextWidth + diffX;
            nextHeight = nextHeight - diffY;
            break;
          case "lb":
            nextWidth = nextWidth - diffX;
            nextHeight = nextHeight + diffY;
            break;
          case "rb":
            nextWidth = nextWidth + diffX;
            nextHeight = nextHeight + diffY;
            break;
        }
        if (nextWidth / nextHeight > ratio) {
          nextHeight = nextWidth / ratio;
        } else {
          nextWidth = nextHeight * ratio;
        }
        const delta = new Delta().retain(raw.start).retain(raw.len, {
          [IMAGE_WIDTH]: String(nextWidth),
          [IMAGE_HEIGHT]: String(nextHeight),
        });
        props.editor.state.apply(delta, { autoCaret: false });
      };
      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  };

  return (
    <>
      {src && <Preview src={src} visible={!!src} onVisibleChange={v => !v && setImage("")} />}
      {!readonly && (
        <Fragment>
          <div
            className={cs(enable && "block-kit-image-resider")}
            data-type="lt"
            onMouseDown={onMouseDown}
          ></div>
          <div
            className={cs(enable && "block-kit-image-resider")}
            data-type="rt"
            onMouseDown={onMouseDown}
          ></div>
          <div
            className={cs(enable && "block-kit-image-resider")}
            data-type="lb"
            onMouseDown={onMouseDown}
          ></div>
          <div
            className={cs(enable && "block-kit-image-resider")}
            data-type="rb"
            onMouseDown={onMouseDown}
          ></div>
        </Fragment>
      )}
      <div ref={ref} onMouseDown={preview} className={cs(enable && "block-kit-image-preview")}>
        {props.children}
      </div>
    </>
  );
};
