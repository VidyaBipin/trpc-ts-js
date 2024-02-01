/**
 * **DO NOT IMPORT FROM HERE FILE**
 *
 * This file is here to:
 * - make TypeScript happy and prevent _"The inferred type of 'createContext' cannot be named without a reference to [...]"_.
 * - the the glue between the official `@trpc/*`-packages
 *
 *
 * If you seem to need to import anything from here, please open an issue at https://github.com/trpc/trpc/issues
 */
export * from './unstable-core-do-not-import/clientish/inference';
export * from './unstable-core-do-not-import/clientish/inferrable';
export * from './unstable-core-do-not-import/clientish/serialize';
export * from './unstable-core-do-not-import/createProxy';
export * from './unstable-core-do-not-import/error/formatter';
export * from './unstable-core-do-not-import/error/getErrorShape';
export * from './unstable-core-do-not-import/error/TRPCError';
export * from './unstable-core-do-not-import/http';
export * from './unstable-core-do-not-import/initTRPC';
export * from './unstable-core-do-not-import/middleware';
export * from './unstable-core-do-not-import/parser';
export * from './unstable-core-do-not-import/procedure';
export * from './unstable-core-do-not-import/procedureBuilder';
export * from './unstable-core-do-not-import/rootConfig';
export * from './unstable-core-do-not-import/router';
export * from './unstable-core-do-not-import/router';
export * from './unstable-core-do-not-import/rpc';
export * from './unstable-core-do-not-import/transformer';
export * from './unstable-core-do-not-import/types';
export * from './unstable-core-do-not-import/utils';
