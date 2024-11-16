import { BOLD_KEY } from "../../bold/types";

export const TOOLBAR_TYPES = [BOLD_KEY] as const;
export const TOOLBAR_KEY_SET = new Set(TOOLBAR_TYPES);
