import { BasicDelta } from "blocks-kit-shared";

import type { AbstractDelta } from "./abstract";

export type Delta = AbstractDelta;
export const Delta = BasicDelta as typeof AbstractDelta;
