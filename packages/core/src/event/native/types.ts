import type { Object } from "block-kit-utils";

export const NATIVE_EVENTS = {
  COMPOSITION_START: "compositionstart",
  COMPOSITION_UPDATE: "compositionupdate",
  COMPOSITION_END: "compositionend",
  COPY: "copy",
  CUT: "cut",
  PASTE: "paste",
  KEY_DOWN: "keydown",
  KEY_PRESS: "keypress",
  KEY_UP: "keyup",
  BEFORE_INPUT: "beforeinput",
  INPUT: "input",
  FOCUS: "focus",
  BLUR: "blur",
  SELECTION_CHANGE_NATIVE: "selectionchange",
  MOUSE_DOWN: "mousedown",
  MOUSE_UP: "mouseup",
  MOUSE_DOWN_GLOBAL: "mousedown_global",
  MOUSE_UP_GLOBAL: "mouseup_global",
} as const;

export type NativeEventMap = {
  [NATIVE_EVENTS.COMPOSITION_START]: CompositionEvent;
  [NATIVE_EVENTS.COMPOSITION_UPDATE]: CompositionEvent;
  [NATIVE_EVENTS.COMPOSITION_END]: CompositionEvent;
  [NATIVE_EVENTS.BEFORE_INPUT]: InputEvent;
  [NATIVE_EVENTS.INPUT]: InputEvent;
  [NATIVE_EVENTS.COPY]: ClipboardEvent;
  [NATIVE_EVENTS.CUT]: ClipboardEvent;
  [NATIVE_EVENTS.PASTE]: ClipboardEvent;
  [NATIVE_EVENTS.KEY_DOWN]: KeyboardEvent;
  [NATIVE_EVENTS.KEY_PRESS]: KeyboardEvent;
  [NATIVE_EVENTS.KEY_UP]: KeyboardEvent;
  [NATIVE_EVENTS.FOCUS]: FocusEvent;
  [NATIVE_EVENTS.BLUR]: FocusEvent;
  [NATIVE_EVENTS.SELECTION_CHANGE_NATIVE]: Event;
  [NATIVE_EVENTS.MOUSE_DOWN]: MouseEvent;
  [NATIVE_EVENTS.MOUSE_UP]: MouseEvent;
  [NATIVE_EVENTS.MOUSE_DOWN_GLOBAL]: MouseEvent;
  [NATIVE_EVENTS.MOUSE_UP_GLOBAL]: MouseEvent;
};

type NativeEventMapType = typeof NATIVE_EVENTS;
type NativeEventMapKeys = Object.Values<NativeEventMapType>;
export type NativeEventHandler = (e: Event) => void;
export type Listener<T extends NativeEventMapKeys> = (value: NativeEventMap[T]) => void;
export type Listeners = { [T in NativeEventMapKeys]?: Listener<T> };
