import { Bind } from "block-kit-utils";

import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/types";
import { EDITOR_STATE } from "../state/types";

export class Input {
  /**
   * 构造函数
   * @param editor
   */
  constructor(protected editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
    this.editor.event.on(EDITOR_EVENT.COMPOSITION_END, this.onCompositionEnd);
  }

  /**
   * 销毁组件
   */
  public destroy() {
    this.editor.event.off(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
    this.editor.event.off(EDITOR_EVENT.COMPOSITION_END, this.onCompositionEnd);
  }

  /**
   * BeforeInput
   * @param event
   */
  @Bind
  protected onBeforeInput(event: InputEvent) {
    if (this.editor.state.get(EDITOR_STATE.COMPOSING)) {
      return null;
    }
    event.preventDefault();
    const { inputType, data = "" } = event;
    const sel = this.editor.selection.get();
    if (!sel) {
      return null;
    }
    switch (inputType) {
      case "deleteByComposition":
      case "deleteByCut":
      case "deleteByDrag": {
        this.editor.perform.deleteFragment(sel);
        break;
      }
      case "deleteWordBackward":
      case "deleteContentBackward": {
        this.editor.perform.deleteBackward(sel);
        break;
      }
      case "deleteContent":
      case "deleteWordForward":
      case "deleteContentForward": {
        this.editor.perform.deleteForward(sel);
        break;
      }
      case "insertLineBreak":
      case "insertParagraph": {
        this.editor.perform.insertBreak(sel);
        break;
      }
      case "insertFromDrop":
      case "insertFromPaste":
      case "insertFromYank":
      case "insertReplacementText":
      case "insertText": {
        data && this.editor.perform.insertText(sel, data);
        break;
      }
      default:
        break;
    }
  }

  /**
   * 组合输入结束
   * @param event
   */
  @Bind
  protected onCompositionEnd(event: CompositionEvent) {
    const data = event.data;
    const sel = this.editor.selection.get();
    data && sel && this.editor.perform.insertText(sel, data);
    event.preventDefault();
  }
}
