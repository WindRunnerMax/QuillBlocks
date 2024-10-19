import type { Delta } from "block-kit-delta";
import type { Object } from "block-kit-utils";
import type { Reflex } from "block-kit-utils";

import type { Range } from "../../selection/modules/range";
import type { NativeEventMap } from "../native/types";
import { NATIVE_EVENTS } from "../native/types";

export const EDITOR_EVENT = {
  CONTENT_CHANGE: "CONTENT_CHANGE",
  SELECTION_CHANGE: "SELECTION_CHANGE",
  PAINT: "PAINT",
  ...NATIVE_EVENTS,
} as const;

export type ContentChangeEvent = {
  current: Delta;
  previous: Delta;
  source: string;
  changes: Delta;
};

export type SelectionChangeEvent = {
  previous: Range | null;
  current: Range | null;
};

export type EventMap = {
  [EDITOR_EVENT.CONTENT_CHANGE]: ContentChangeEvent;
  [EDITOR_EVENT.SELECTION_CHANGE]: SelectionChangeEvent;
  [EDITOR_EVENT.PAINT]: PaintEvent;
} & NativeEventMap;

// eslint-disable-next-line @typescript-eslint/ban-types
export type PaintEvent = {};
export type EventMapType = typeof EDITOR_EVENT;
export type EventMapKeys = Object.Values<EventMapType>;
export type EditorEvent = Reflex.Tuple<EventMap>;
export type EditorEventArgs = Reflex.Array<EventMap>;
export type AssertEventMap<T extends EventMapKeys> = EventMap[T];
