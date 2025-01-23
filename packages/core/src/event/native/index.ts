import type { Editor } from "../../editor";
import { EDITOR_STATE } from "../../state/types";
import type { EventBus } from "../bus";
import { NATIVE_EVENTS } from "./types";

export class NativeEvent {
  constructor(protected event: EventBus, protected editor: Editor) {}

  protected onCompositionStart = (e: CompositionEvent) => {
    this.editor.state.set(EDITOR_STATE.COMPOSING, true);
    this.event.emit(NATIVE_EVENTS.COMPOSITION_START, e);
  };

  protected onCompositionUpdate = (e: CompositionEvent) => {
    this.event.emit(NATIVE_EVENTS.COMPOSITION_UPDATE, e);
  };

  protected onCompositionEnd = (e: CompositionEvent) => {
    this.editor.state.set(EDITOR_STATE.COMPOSING, false);
    this.event.emit(NATIVE_EVENTS.COMPOSITION_END, e);
  };

  protected onBeforeInput = (e: Event) => {
    this.event.emit(NATIVE_EVENTS.BEFORE_INPUT, e as InputEvent);
  };

  protected onInput = (e: Event) => {
    this.event.emit(NATIVE_EVENTS.INPUT, e as InputEvent);
  };

  protected onCopy = (e: ClipboardEvent) => {
    this.event.emit(NATIVE_EVENTS.COPY, e);
  };

  protected onCut = (e: ClipboardEvent) => {
    this.event.emit(NATIVE_EVENTS.CUT, e);
  };

  protected onPaste = (e: ClipboardEvent) => {
    this.event.emit(NATIVE_EVENTS.PASTE, e);
  };

  protected onKeydown = (e: KeyboardEvent) => {
    this.event.emit(NATIVE_EVENTS.KEY_DOWN, e);
  };

  protected onKeypress = (e: KeyboardEvent) => {
    this.event.emit(NATIVE_EVENTS.KEY_PRESS, e);
  };

  protected onKeyup = (e: KeyboardEvent) => {
    this.event.emit(NATIVE_EVENTS.KEY_UP, e);
  };

  protected onFocus = (e: FocusEvent) => {
    this.editor.state.set(EDITOR_STATE.FOCUS, true);
    this.event.emit(NATIVE_EVENTS.FOCUS, e);
  };

  protected onBlur = (e: FocusEvent) => {
    this.editor.state.set(EDITOR_STATE.FOCUS, false);
    this.event.emit(NATIVE_EVENTS.BLUR, e);
  };

  protected onSelectionChange = (e: Event) => {
    this.event.emit(NATIVE_EVENTS.SELECTION_CHANGE_NATIVE, e);
  };

  protected onMouseDown = (e: MouseEvent) => {
    this.event.emit(NATIVE_EVENTS.MOUSE_DOWN, e);
  };

  protected onMouseUp = (e: MouseEvent) => {
    this.event.emit(NATIVE_EVENTS.MOUSE_UP, e);
  };

  protected onMouseDownGlobal = (e: MouseEvent) => {
    this.editor.state.set(EDITOR_STATE.MOUSE_DOWN, true);
    this.event.emit(NATIVE_EVENTS.MOUSE_DOWN, e);
  };

  protected onMouseUpGlobal = (e: MouseEvent) => {
    this.editor.state.set(EDITOR_STATE.MOUSE_DOWN, false);
    this.event.emit(NATIVE_EVENTS.MOUSE_UP, e);
  };

  public bind() {
    this.unbind();
    const container = this.editor.getContainer();
    container.addEventListener(NATIVE_EVENTS.COMPOSITION_START, this.onCompositionStart);
    container.addEventListener(NATIVE_EVENTS.COMPOSITION_UPDATE, this.onCompositionUpdate);
    container.addEventListener(NATIVE_EVENTS.COMPOSITION_END, this.onCompositionEnd);
    container.addEventListener(NATIVE_EVENTS.BEFORE_INPUT, this.onBeforeInput);
    container.addEventListener(NATIVE_EVENTS.INPUT, this.onInput);
    container.addEventListener(NATIVE_EVENTS.COPY, this.onCopy);
    container.addEventListener(NATIVE_EVENTS.CUT, this.onCut);
    container.addEventListener(NATIVE_EVENTS.PASTE, this.onPaste);
    container.addEventListener(NATIVE_EVENTS.KEY_DOWN, this.onKeydown);
    container.addEventListener(NATIVE_EVENTS.KEY_PRESS, this.onKeypress);
    container.addEventListener(NATIVE_EVENTS.KEY_UP, this.onKeyup);
    container.addEventListener(NATIVE_EVENTS.FOCUS, this.onFocus);
    container.addEventListener(NATIVE_EVENTS.BLUR, this.onBlur);
    container.addEventListener(NATIVE_EVENTS.MOUSE_DOWN, this.onMouseDown);
    container.addEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUp);
    document.addEventListener(NATIVE_EVENTS.SELECTION_CHANGE_NATIVE, this.onSelectionChange);
    document.addEventListener(NATIVE_EVENTS.MOUSE_DOWN, this.onMouseDownGlobal);
    document.addEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUpGlobal);
  }

  public unbind() {
    const container = this.editor.getContainer();
    container.removeEventListener(NATIVE_EVENTS.COMPOSITION_START, this.onCompositionStart);
    container.removeEventListener(NATIVE_EVENTS.COMPOSITION_UPDATE, this.onCompositionUpdate);
    container.removeEventListener(NATIVE_EVENTS.COMPOSITION_END, this.onCompositionEnd);
    container.removeEventListener(NATIVE_EVENTS.BEFORE_INPUT, this.onBeforeInput);
    container.removeEventListener(NATIVE_EVENTS.KEY_PRESS, this.onKeypress);
    container.removeEventListener(NATIVE_EVENTS.INPUT, this.onInput);
    container.removeEventListener(NATIVE_EVENTS.COPY, this.onCopy);
    container.removeEventListener(NATIVE_EVENTS.CUT, this.onCut);
    container.removeEventListener(NATIVE_EVENTS.PASTE, this.onPaste);
    container.removeEventListener(NATIVE_EVENTS.KEY_DOWN, this.onKeydown);
    container.removeEventListener(NATIVE_EVENTS.KEY_UP, this.onKeyup);
    container.removeEventListener(NATIVE_EVENTS.FOCUS, this.onFocus);
    container.removeEventListener(NATIVE_EVENTS.BLUR, this.onBlur);
    container.removeEventListener(NATIVE_EVENTS.MOUSE_DOWN, this.onMouseDown);
    container.removeEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUp);
    document.removeEventListener(NATIVE_EVENTS.SELECTION_CHANGE_NATIVE, this.onSelectionChange);
    document.removeEventListener(NATIVE_EVENTS.MOUSE_DOWN, this.onMouseDownGlobal);
    document.removeEventListener(NATIVE_EVENTS.MOUSE_UP, this.onMouseUpGlobal);
  }
}
