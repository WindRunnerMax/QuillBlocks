import { useMemo, useRef } from "react";

type Fn = (this: never, ...args: never[]) => unknown;

export const useMemoizedFn = <T extends Fn>(fn: T) => {
  const fnRef = useRef<T>(fn);

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFn = useRef<T>();
  if (!memoizedFn.current) {
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);
    } as T;
  }

  return memoizedFn.current as T;
};
