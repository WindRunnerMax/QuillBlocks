import type { LineState } from "../../src/state/modules/line-state";

export const echoLines = (lines: LineState[]) => {
  lines.forEach(echoLineState);
};

export const echoLineState = (lineState: LineState) => {
  console.log("LineState", lineState.getOps());
};
