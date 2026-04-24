/**
 * Convert between snake_case (database) and camelCase (frontend).
 * Used at the service boundary — prefer keeping snake_case end-to-end when
 * the downstream code already speaks it.
 */

type Snake<S extends string> = S extends `${infer A}${infer B}`
  ? A extends Uppercase<A>
    ? A extends Lowercase<A>
      ? `${A}${Snake<B>}`
      : `_${Lowercase<A>}${Snake<B>}`
    : `${A}${Snake<B>}`
  : S;

type Camel<S extends string> = S extends `${infer A}_${infer B}`
  ? `${A}${Capitalize<Camel<B>>}`
  : S;

export type SnakeCaseKeys<T> = {
  [K in keyof T as K extends string ? Snake<K> : K]: T[K];
};

export type CamelCaseKeys<T> = {
  [K in keyof T as K extends string ? Camel<K> : K]: T[K];
};

export function snakeToCamel<T extends Record<string, unknown>>(
  obj: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const ck = k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
    out[ck] = v;
  }
  return out;
}

export function camelToSnake<T extends Record<string, unknown>>(
  obj: T,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const sk = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    out[sk] = v;
  }
  return out;
}
