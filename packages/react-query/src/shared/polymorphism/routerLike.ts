import type {
  AnyMutationProcedure,
  AnyProcedure,
  AnyQueryProcedure,
  AnyRootConfigTypes,
  AnyRouter,
} from '@trpc/server/unstable-core-do-not-import';
import type { MutationLike } from './mutationLike';
import type { QueryLike } from './queryLike';

/**
 * Use to describe a route path which matches a given route's interface
 */
export type RouterLike<TRouter extends AnyRouter> = RouterLikeInner<
  TRouter['_def']['_config']['$types'],
  TRouter['_def']['procedures']
>;
export type RouterLikeInner<
  TConfig extends AnyRootConfigTypes,
  TProcedures extends AnyProcedure,
> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? RouterLikeInner<TConfig, TProcedures[TKey]['_def']['record']>
    : TProcedures[TKey] extends AnyQueryProcedure
    ? QueryLike<TConfig, TProcedures[TKey]>
    : TProcedures[TKey] extends AnyMutationProcedure
    ? MutationLike<TConfig, TProcedures[TKey]>
    : never;
};
