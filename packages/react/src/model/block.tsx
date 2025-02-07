import type { BlockState, Editor } from "block-kit-core";
import { BLOCK_KEY, EDITOR_EVENT, EDITOR_STATE } from "block-kit-core";
import { useMemoFn } from "block-kit-utils/dist/es/hooks";
import type { FC } from "react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { LineModel } from "./line";

const BlockView: FC<{
  editor: Editor;
  state: BlockState;
}> = props => {
  const { editor, state } = props;
  const flushing = useRef(false);
  const [lines, setLines] = useState(() => state.getLines());

  const setModel = (ref: HTMLDivElement | null) => {
    if (ref) {
      editor.model.setBlockModel(ref, state);
    }
  };

  const onContentChange = useMemoFn(() => {
    // 数据同步变更, 异步批量绘制变更
    // 举个例子: 同步等待刷新的队列 => ||||||||
    // 进入更新行为后, 异步行为等待, 同步的队列由于 !flushing 全部被守卫
    // 主线程执行完毕后, 异步队列开始执行, 此时拿到的是最新数据, 以此批量重新渲染
    if (flushing.current) return void 0;
    flushing.current = true;
    Promise.resolve().then(() => {
      flushing.current = false;
      setLines(state.getLines());
      editor.state.set(EDITOR_STATE.PAINTING, true);
    });
  });

  useLayoutEffect(() => {
    editor.event.on(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    return () => {
      editor.event.off(EDITOR_EVENT.CONTENT_CHANGE, onContentChange);
    };
  }, [editor.event, onContentChange]);

  useLayoutEffect(() => {
    // 视图更新需要重新设置选区 无依赖数组
    const selection = editor.selection.get();
    if (
      !editor.state.get(EDITOR_STATE.COMPOSING) &&
      editor.state.get(EDITOR_STATE.FOCUS) &&
      selection
    ) {
      // 更新浏览器选区
      editor.logger.debug("UpdateDOMSelection");
      editor.selection.updateDOMSelection();
    }
  });

  useEffect(() => {
    // 视图更新需要触发视图绘制完成事件 无依赖数组
    editor.logger.debug("OnPaint");
    editor.state.set(EDITOR_STATE.PAINTING, false);
    Promise.resolve().then(() => {
      editor.event.trigger(EDITOR_EVENT.PAINT, {});
    });
  });

  return (
    <div className="notranslate" {...{ [BLOCK_KEY]: true }} ref={setModel}>
      {lines.map((line, index) => (
        <LineModel key={line.key} editor={editor} lineState={line} index={index}></LineModel>
      ))}
    </div>
  );
};

export const BlockModel = React.memo(BlockView);
