import type { Editor } from "../editor";
import { EDITOR_EVENT } from "../event/bus/types";
import { EDITOR_STATE } from "../state/types";
import {
  deleteBackward,
  deleteForward,
  deleteFragment,
  insertBreak,
  insertText,
} from "./modules/execute";

export class Input {
  constructor(private editor: Editor) {
    this.editor.event.on(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
    this.editor.event.on(EDITOR_EVENT.COMPOSITION_END, this.onCompositionEnd);
  }

  destroy() {
    this.editor.event.off(EDITOR_EVENT.BEFORE_INPUT, this.onBeforeInput);
    this.editor.event.off(EDITOR_EVENT.COMPOSITION_END, this.onCompositionEnd);
  }

  private onBeforeInput = (event: InputEvent) => {
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
        deleteFragment(this.editor, sel);
        break;
      }
      case "deleteWordBackward":
      case "deleteContentBackward": {
        deleteBackward(this.editor, sel);
        break;
      }
      case "deleteContent":
      case "deleteWordForward":
      case "deleteContentForward": {
        deleteForward(this.editor, sel);
        break;
      }
      case "insertLineBreak":
      case "insertParagraph": {
        insertBreak(this.editor, sel);
        break;
      }
      case "insertFromDrop":
      case "insertFromPaste":
      case "insertFromYank":
      case "insertReplacementText":
      case "insertText": {
        data && insertText(this.editor, sel, data);
        break;
      }
      default:
        break;
    }
  };

  private onCompositionEnd = (event: CompositionEvent) => {
    const data = event.data;
    const sel = this.editor.selection.get();
    data && sel && insertText(this.editor, sel, data);
    event.preventDefault();
  };
}
