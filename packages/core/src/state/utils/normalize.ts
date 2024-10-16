import type { LineState } from "../modules/line-state";

/**
 * 根据 offset 二分查找 LineState[] 中的 LineState
 * @param lines
 * @param offset
 */
export const binarySearch = (lines: LineState[], offset: number) => {
  let start = 0;
  let end = lines.length - 1;
  while (start <= end) {
    const mid = Math.floor((start + end) / 2);
    const lineStart = lines[mid].start;
    const lineEnd = lineStart + lines[mid].length;
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
