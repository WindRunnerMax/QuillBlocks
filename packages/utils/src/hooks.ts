import type { DependencyList, EffectCallback, MutableRefObject, SetStateAction } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Func } from "./types";

/**
 * 当前组件挂载状态
 */
export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    mounted: isMounted,
    isMounted: () => isMounted.current,
  };
};

/**
 * 安全地使用 useState
 * @param {S} value 状态
 * @param {MutableRefObject<boolean>} mounted 组件挂载状态
 */
export const useMountState = <S = undefined>(value: S, mounted: MutableRefObject<boolean>) => {
  const [state, setStateOrigin] = useState<S>(value);

  const setCurrentState = useCallback((next: SetStateAction<S>) => {
    if (!mounted.current) return void 0;
    setStateOrigin(next);
  }, []);

  return [state, setCurrentState] as const;
};

/**
 * 安全地使用 useState
 * @param {S} value 状态
 */
export const useSafeState = <S = undefined>(value: S) => {
  const [state, setStateOrigin] = useState<S>(value);
  const { mounted } = useIsMounted();

  const setCurrentState = useCallback((next: SetStateAction<S>) => {
    if (!mounted.current) return void 0;
    setStateOrigin(next);
  }, []);

  return [state, setCurrentState] as const;
};

/**
 * State 与 Ref 的使用与更新
 * @param {S} value 状态
 */
export const useStateRef = <S = undefined>(value: S) => {
  const [state, setStateOrigin] = useState<S>(value);
  const { mounted } = useIsMounted();
  const ref = useRef(state);

  const setState = useCallback((next: S) => {
    if (!mounted.current) return void 0;
    ref.current = next;
    setStateOrigin(next);
  }, []);

  return [state, setState, ref] as const;
};

/**
 * 避免挂载时触发副作用
 * @param {EffectCallback} effect 副作用依赖
 * @param {DependencyList} deps 依赖
 */
export const useUpdateEffect = (effect: EffectCallback, deps?: DependencyList) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};

/**
 * 避免挂载时触发副作用
 * @param {EffectCallback} effect 副作用依赖
 * @param {DependencyList} deps 依赖
 */
export const useUpdateLayoutEffect = (effect: EffectCallback, deps?: DependencyList) => {
  const isMounted = useRef(false);

  useLayoutEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }
  }, deps);
};

/**
 * 保证 re-render 时的同一函数引用
 * - 类似于 useCallback 而不需要依赖
 * @param {Func.Any} fn 方法
 */
export const useMemoFn = <T extends Func.Any>(fn: T) => {
  const fnRef = useRef(fn);
  const memoFn = useRef<Func.Any>();

  fnRef.current = fn;
  if (!memoFn.current) {
    memoFn.current = function (this: unknown, ...args: unknown[]) {
      return fnRef.current.apply(this, args);
    };
  }

  return memoFn.current as T;
};

/**
 * 强制更新组件
 */
export const useForceUpdate = () => {
  const [index, setState] = useState(0);
  const update = useCallback(() => setState(prev => prev + 1), []);
  return { index, update, forceUpdate: update };
};

/**
 * 判断首次渲染
 */
export const useIsFirstRender = () => {
  const isFirst = useRef<boolean>(true);

  useEffect(() => {
    isFirst.current = false;
  }, []);

  return {
    firstRender: isFirst,
    isFirstRender: () => isFirst.current,
  };
};
