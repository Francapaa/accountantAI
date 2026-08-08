/**
 * Ambient declaration for the `k6/test` module, which is part of the k6
 * runtime but not yet shipped in @types/k6.
 */
declare module "k6/test" {
  export interface TestAPI {
    abort(message?: string): never;
  }
  export const test: TestAPI;
}