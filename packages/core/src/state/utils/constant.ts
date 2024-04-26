export const EDITOR_STATE = {
  COMPOSING: "COMPOSING",
  MOUNTED: "MOUNTED",
  READONLY: "READONLY",
  MOUSE_DOWN: "MOUSE_DOWN",
  FOCUS: "FOCUS",
} as const;

export const APPLY_SOURCE = {
  USER: "USER",
  HISTORY: "HISTORY",
};

export const EDITABLE_KEY = "contenteditable";
export const DATA_BLOCK_KEY = "data-block";
export const DATA_LINE_KEY = "data-line";
export const DATA_BLOCK_ID_KEY = "data-block-id";
export const DATA_TYPE_KEY = "data-type";
