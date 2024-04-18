import type { Delta } from "../delta/delta";
import { isInsertOp } from "../delta/op";

export const deltaEndsWith = (delta: Delta, text: string): boolean => {
  const ops = delta.ops;
  let index = text.length - 1;
  for (const op of ops) {
    if (isInsertOp(op)) {
      const opText = op.insert;
      for (let i = opText.length - 1; i >= 0; --i) {
        if (opText[i] !== text[index]) return false;
        --index;
        if (index < 0) return true;
      }
    }
  }
  return false;
};
