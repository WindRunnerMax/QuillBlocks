import { EDITOR_KEY, EDITOR_STATE, Point, Range } from "block-kit-core";
import React, { useEffect, useLayoutEffect, useRef } from "react";

import { useEditorStatic } from "../hooks/use-editor";
import { BlockModel } from "../model/block";

export const Editable: React.FC<{
  readonly?: boolean;
  className?: string;
  autoFocus?: boolean;
}> = props => {
  const { readonly, className, autoFocus } = props;
  const { editor } = useEditorStatic();
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    el && editor.onMount(el);
    return () => {
      editor.destroy();
    };
  }, [editor]);

  useEffect(() => {
    editor.state.set(EDITOR_STATE.READONLY, readonly || false);
  }, [editor.state, readonly]);

  useEffect(() => {
    // COMPAT: 这里有个奇怪的表现
    // 当自动聚焦时, 必须要先更新浏览器选区再聚焦
    // 否则会造成立即按下回车时, 光标不会跟随选区移动
    // 无论是 Model 选区还是浏览器选区, 都已经更新但是却不移动
    if (autoFocus) {
      const start = new Point(0, 0);
      editor.selection.set(new Range(start, start), true);
      editor.selection.focus();
    }
  }, [autoFocus, editor.selection]);

  return (
    <div
      ref={ref}
      className={className}
      {...{ [EDITOR_KEY]: true }}
      contentEditable={!readonly}
      suppressContentEditableWarning
      style={{
        outline: "none",
        position: "relative",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      <BlockModel editor={editor} state={editor.state.block}></BlockModel>
    </div>
  );
};
