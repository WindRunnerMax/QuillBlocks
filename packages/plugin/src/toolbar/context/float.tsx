import "../styles/float.scss";

import { EDITOR_EVENT } from "block-kit-core";
import { useEditorStatic, useReadonly } from "block-kit-react";
import { cs } from "block-kit-utils";
import { useMemoFn } from "block-kit-utils/dist/es/hooks";
import type { FC } from "react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import { getMountDOM } from "../../shared/utils/dom";
import { Toolbar } from "./provider";

export const FloatToolbar: FC<{
  className?: string;
  /**
   * 预设宽度 [计算位置用]
   */
  width: number;
  /**
   * 高度偏移
   */
  offsetHeight: number;
}> = props => {
  const { editor } = useEditorStatic();
  const { readonly } = useReadonly();
  const keep = useRef(false);
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const onWeakUp = useMemoFn((wakeUp: boolean) => {
    const rect = editor.rect.getSelectionRect();
    if (editor.state.isFocused() && wakeUp) {
      if (rect) {
        const t = rect.top - props.offsetHeight;
        const l = rect.left - props.width / 2 + rect.width / 2;
        setTop(t);
        setLeft(l);
      }
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  useEffect(() => {
    if (readonly) return void 0;
    const onMouseUp = () => {
      !keep.current && setIsMouseDown(false);
    };
    const onMouseDown = () => {
      !keep.current && setIsMouseDown(true);
    };
    const onSelectionChange = () => {
      if (keep.current) return void 0;
      const sel = window.getSelection();
      const isWakeUp = sel ? !sel.isCollapsed : false;
      onWeakUp(isWakeUp);
    };
    document.addEventListener(EDITOR_EVENT.MOUSE_UP, onMouseUp);
    document.addEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
    editor.event.on(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    return () => {
      document.removeEventListener(EDITOR_EVENT.MOUSE_UP, onMouseUp);
      document.removeEventListener(EDITOR_EVENT.MOUSE_DOWN, onMouseDown);
      editor.event.off(EDITOR_EVENT.SELECTION_CHANGE, onSelectionChange);
    };
  }, [editor, onWeakUp, readonly]);

  // 只读状态 / 不可见 / 鼠标按下 时隐藏
  return readonly || !visible || isMouseDown
    ? null
    : ReactDOM.createPortal(
        <Toolbar
          ref={ref}
          className={cs("block-kit-float-toolbar", props.className)}
          top={top}
          left={left}
        >
          {props.children}
        </Toolbar>,
        getMountDOM(editor)
      );
};
