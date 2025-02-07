/* eslint-disable no-shadow */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-explicit-any */
const global = typeof globalThis !== "undefined" ? globalThis : window;
export const Array = global.Array;
export const Object = global.Object;
export const String = global.String;

/**
 * Primitive
 */
export namespace Primitive {
  /**
   * Any
   * @example any
   */
  export type Any = any;
  /**
   * Null
   * @example null
   */
  export type Null = null;
  /**
   * Never
   * @example never
   */
  export type Never = never;
  /**
   * Mixed
   * @example unknown
   */
  export type Mixed = unknown;
  /**
   * Undef
   * @example undefined
   */
  export type Undef = undefined;
  /**
   * NonNullable
   * @example NonNullable<null> => never
   * @example NonNullable<string | null | undefined> => string
   * @example NonNullable<string | number | null | undefined> => string | number
   */
  export type NonNullable<T> = T & {};
  /**
   * Nil
   * @example undefined | null
   */
  export type Nil = undefined | null;
  /**
   * Class
   * @example Class<number> => new (...args: Any[]) => number
   */
  export type Class<T> = new (...args: Any[]) => T;
  /**
   * Truly
   * @example Truly<""> => never
   * @example Truly<number> => number
   * @example Truly<string> => string
   */
  export type Truly<T> = T extends Falsy ? never : T;
  /**
   * Nullish
   * @example undefined | null
   */
  export type Nullish<T = undefined> = undefined | null | T;
  /**
   * Falsy
   * @example false | "" | 0 | null | undefined | 0n
   */
  export type Falsy = false | "" | 0 | null | undefined | 0n;
  /**
   * Promise
   * @example Promise<globalThis.Promise<string>> => string
   */
  export type Promise<T> = T extends globalThis.Promise<infer R> ? R : never;
  /**
   * Tuple
   * @example string | number | boolean | symbol | bigint | undefined | null
   */
  export type Tuple = string | number | boolean | symbol | bigint | undefined | null;
}

/**
 * Object
 */
export namespace Object {
  /**
   * Plain
   * @example {}
   */
  export type Plain = {};
  /**
   * Any
   * @example Record<string, any>
   */
  export type Any = Record<Key, any>;
  /**
   * Never
   * @example Record<string, never>
   */
  export type Never = Record<Key, never>;
  /**
   * Map
   * @example Map<number> => Record<string, number>
   * @example Map<string> => Record<string, string>
   */
  export type Map<T> = Record<string, T>;
  /**
   * Mixed
   * @example Record<string, unknown>
   */
  export type Mixed = Record<Key, unknown>;
  /**
   * Key
   * @example string | number | symbol
   */
  export type Key = string | number | symbol;
  /**
   * Unknown
   * @example Record<string, unknown>
   */
  export type Unknown = Record<Key, unknown>;
  /**
   * Nested
   * @example { [key: Key]: string | Nested }
   */
  export type Nested = { [key: Key]: string | Nested };
  /**
   * Keys
   * @example Keys<{ a: A; b: B }> => "a" | "b"
   */
  export type Keys<T extends Record<Object.Key, unknown>> = keyof T;
  /**
   * Pick
   * @example Pick<{ a: A; b: B }, "c"> => {}
   * @example Pick<{ a: A; b: B }, "a"> => { a: A }
   * @example Pick<{ a: A; b: B }, "a" | "b"> => { a: A; b: B }
   */
  export type Pick<T extends Any, K extends keyof T> = { [P in K]: T[P] };
  /**
   * Values
   * @example Values<{ a: A; b: B }> => A | B
   */
  export type Values<T extends Record<Object.Key, unknown>> = T[keyof T];
  /**
   * Omit
   * @example Omit<{ a: A; b: B }, "a"> => { b: B }
   * @example Omit<{ a: A; b: B }, "a" | "b"> => {}
   * @example Omit<{ a: A; b: B }, "c"> => { a: A; b: B }
   */
  export type Omit<T extends Any, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
  /**
   * Merge
   * @example Merge<{ a: A; c: C }, { b: B }> => { a: A; c: C; b: B }
   * @example Merge<{ a: A; c: C }, { a: B }> => { a: B; c: C }
   * @example Merge<{ a: A; c: C }, { a: B; c: D }> => { a: B; c: D }
   */
  export type Merge<T extends Unknown, R> = Omit<Omit<T, Extract<keyof T, keyof R>> & R, never>;
  /**
   * _Pipe
   * @example _Pipe<"a", { a: A }, { a: B }> => B
   * @example _Pipe<"c", { a: A }, { a: B; c: C }> => C
   * @example _Pipe<"c", { a: A; c: C }, { a: B }> => unknown
   */
  type _Pipe<K extends Key, T extends Unknown, R extends Unknown> = R[K] extends Unknown
    ? T[K] extends Unknown
      ? DeepMerge<T[K], R[K]>
      : R[K]
    : R[K];
  /**
   * DeepMerge
   * @example DeepMerge<{ a: A; c: { d: D } }, { b: B }> => { a: A; c: { d: D; }; b: B; }
   */
  export type DeepMerge<T extends Unknown, R extends Unknown> = Merge<
    // FIX: 不能合并为 P in keyof T | keyof R  会导致 ? 标识符消失
    { [K in keyof T]: K extends keyof R ? _Pipe<K, T, R> : T[K] },
    { [K in keyof R]: K extends keyof T ? _Pipe<K, T, R> : R[K] }
  >;
  /**
   * Flatten
   * @example Flatten<{ a: ""; b: { c: ""; d: { e: "" } } }> => "a" | "b.c" | "b.d.e"
   */
  export type Flatten<T extends Nested, Key = keyof T> = Key extends string
    ? T[Key] extends Nested
      ? `${Key}.${Flatten<T[Key]>}`
      : `${Key}`
    : never;
}

/**
 * Array
 */
export namespace Array {
  /**
   * Plain
   * @example []
   */
  export type Plain = [];
  /**
   * Any
   * @example any[]
   */
  export type Any = any[];
  /**
   * Never
   * @example never[]
   */
  export type Never = never[];
  /**
   * Mixed
   * @example unknown[]
   */
  export type Mixed = unknown[];
  /**
   * Unknown
   * @example unknown[]
   */
  export type Unknown = unknown[];
  /**
   * Tuple
   * @example Tuple<string[]> => string
   * @example Tuple<["A", "B"]> => "A" | "B"
   * @example Tuple<[number, string]> => number | string
   */
  export type Tuple<T extends readonly unknown[]> = T[number];
  /**
   * Values
   * @example Values<string[]> => string
   * @example Values<["A", "B"]> => "A" | "B"
   * @example Values<[number, string]> => number | string
   */
  export type Values<T extends readonly unknown[]> = T[number];
}

/**
 * String
 */
export namespace String {
  /**
   * Plain
   * @example ""
   */
  export type Plain = "";
  /**
   * Primitive
   * @example string | number | boolean
   */
  export type Primitive = string | number | boolean;
  /**
   * Map
   * @example Map<"A" | "B"> => { A: "A"; B: "B"; }
   */
  export type Map<T extends string> = { [P in T]: P };
}

/**
 * Function
 */
export namespace Func {
  /**
   * Plain
   * @example () => void
   */
  export type Plain = () => void;
  /**
   * Any
   * @example (this: any, ...args: any[]) => any
   */
  export type Any = (this: any, ...args: any[]) => any;
  /**
   * AnyClass
   * @example abstract new (...args: any[]) => any
   */
  export type AnyClass = abstract new (...args: any[]) => any;
  /**
   * Never
   * @example (this: never, ...args: never[]) => never
   */
  export type Never = (this: never, ...args: never[]) => never;
  /**
   * Mixed
   * @example (this: unknown, ...args: unknown[]) => unknown
   */
  export type Mixed = (this: unknown, ...args: unknown[]) => unknown;
  /**
   * Unknown
   * @example (this: unknown, ...args: unknown[]) => unknown
   */
  export type Unknown = (this: unknown, ...args: unknown[]) => unknown;
  /**
   * Args
   * @example Args<() => void> => []
   * @example Args<(a: A, b: B) => void> => [a: A, b: B]
   * @example Args<(a: A, b: B, ...rest: C[]) => void> => [a: A, b: B, ...rest: C[]]
   */
  export type Args<T extends Func.Any> = T extends (...args: infer A) => any ? A : never;
  /**
   * Return
   * @example Return<() => void> => void
   * @example Return<() => number> => number
   * @example Return<() => Promise<void>> => Promise<void>
   */
  export type Return<T extends Func.Any> = T extends (...args: any[]) => infer R ? R : any;
  /**
   * Constructor
   * @example Constructor<new () => void> => []
   * @example Constructor<new (a: A, b: B) => void> => [a: A, b: B]
   * @example Constructor<new (a: A, b: B, ...rest: C[]) => void> => [a: A, b: B, ...rest: C[]]
   */
  export type Constructor<T extends AnyClass> = T extends abstract new (...args: infer P) => any
    ? P
    : never;
}

/**
 * Reflex
 */
export namespace Reflex {
  /**
   * _ToArray
   * @example _ToArray<"a", { b: B }> => [type: "a", payload: null]
   * @example _ToArray<"b", { b: never }> => [type: "b", payload: never]
   * @example _ToArray<"a" | "b", { a: A; b: B }> => [type: "a", payload: A] | [type: "b", payload: B]
   */
  type _ToArray<T, M extends Object.Unknown> = T extends string
    ? [type: T, payload: unknown extends M[T] ? null : M[T]]
    : never;
  /**
   * _ToMap
   * @example _ToMap<"a", { a: A }> => { a: { type: "a"; payload: A } }
   * @example _ToMap<"a", { b: B }> => { a: { type: "a"; payload: never } }
   * @example _ToMap<"a" | "b", { a: A, b: B }> => { a: { type: "a"; payload: A }, b: { type: "b"; payload: B } }
   */
  type _ToMap<T extends Object.Key, M extends Record<Object.Key, unknown>> = {
    [P in T]: { type: P; payload: unknown extends M[P] ? never : M[P] };
  };
  /**
   * _Spread
   * @example _Spread<"a", { b: B }> => { a: never }
   * @example _Spread<"a", { a: A }> => { a: A & { key: "a" } }
   * @example _Spread<"a" | "b", { a: A, b: B }> => { a: A & { key: "a" }, b: B & { key: "b" } }
   */
  type _Spread<T extends Object.Key, M extends Record<Object.Key, unknown>> = {
    [P in T]: unknown extends M[P] ? never : M[P] & { key: P };
  };
  /**
   * Array
   * @example Array<{ a: A, b: B }> => [type: "a", payload: A] | [type: "b", payload: B]
   */
  export type Array<M extends Object.Unknown> = _ToArray<Object.Keys<M>, M>;
  /**
   * Tuple
   * @example Tuple<{ a: A, b: B }> => { type: "a"; payload: A; } | { type: "b"; payload: B; }
   */
  export type Tuple<M extends Object.Unknown> = Object.Values<_ToMap<Object.Keys<M>, M>>;
  /**
   * Spread
   * @example Spread<{ a: A, b: B }> => ({ key: "a" } & A) | ({ key: "b" } & B)
   */
  export type Spread<M extends Object.Unknown> = Object.Values<_Spread<Object.Keys<M>, M>>;
  /**
   * Required
   * @example Required<{ a?: A, b?: { c?: C } }> => { a: A, b: { c: C } }
   */
  export type Required<M extends Object.Any> = {
    [K in keyof M]-?: M[K] & {} extends Object.Any ? Reflex.Required<M[K]> : M[K];
  };
  /**
   * Mutable
   * @example Mutable<{ readonly a: A, b: { readonly c: C }}> => { a: A, b: { c: C } }
   */
  export type Mutable<M extends Object.Any> = {
    -readonly [K in keyof M]: M[K] & {} extends Object.Any ? Reflex.Mutable<M[K]> : M[K];
  };
}

import A = Array;
import F = Func;
import O = Object;
import P = Primitive;
import R = Reflex;
import S = String;
export type { A, F, O, P, R, S };
