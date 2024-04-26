import type { LineState } from "../../state/line-state";

export const binarySearch = (lines: LineState[], offset: number) => {
  let start = 0;
  let end = lines.length - 1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const lineStart = lines[mid].start;
    const lineEnd = lineStart + lines[mid].size;
    if (offset >= lineStart && offset < lineEnd) {
      return lines[mid];
    } else if (offset < lineStart) {
      end = mid - 1;
    } else {
      start = mid + 1;
    }
  }
  return null;
};
