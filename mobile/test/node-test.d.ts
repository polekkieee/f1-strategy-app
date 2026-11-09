declare module "node:test" {
  export function describe(
    name: string,
    fn: () => void | Promise<void>
  ): Promise<void>;
  export function it(
    name: string,
    fn: () => void | Promise<void>
  ): Promise<void>;
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
}

declare module "node:assert/strict" {
  const assert: {
    equal<T>(
      actual: unknown,
      expected: T,
      message?: string
    ): asserts actual is T;
    deepEqual<T>(
      actual: unknown,
      expected: T,
      message?: string
    ): asserts actual is T;
    ok(value: unknown, message?: string): asserts value;
    match(value: string, regExp: RegExp, message?: string): void;
  };
  export default assert;
}
