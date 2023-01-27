import {
  AnyMutationProcedure,
  AnyQueryProcedure,
  AnyRouter,
  DeepPartial,
  inferProcedureInput,
} from '@trpc/server';
import { QueryType, getArrayQueryKey } from '../internals/getArrayQueryKey';
import { DecorateProcedure, DecoratedProcedureRecord } from '../shared';

/**
 * We treat `undefined` as an input the same as omitting an `input`
 * https://github.com/trpc/trpc/issues/2290
 */
export function getQueryKeyInternal(
  path: string,
  input: unknown,
): [string] | [string, unknown] {
  if (path.length) return input === undefined ? [path] : [path, input];
  return [] as unknown as [string];
}

/**
 * Method to extract the query key for a procedure
 * @param type - defaults to `any`
 * @link https://trpc.io/docs/useContext#-the-function-i-want-isnt-here
 */
export function getQueryKey<
  TProcedureOrRouter extends
    | AnyQueryProcedure
    | AnyMutationProcedure
    | AnyRouter,
  TPath extends string,
  TFlags,
>(
  ..._params: TProcedureOrRouter extends AnyQueryProcedure
    ? [
        procedureOrRouter: DecorateProcedure<TProcedureOrRouter, TFlags, TPath>,
        ..._params: inferProcedureInput<TProcedureOrRouter> extends undefined
          ? []
          : [
              input?: inferProcedureInput<TProcedureOrRouter> extends {
                cursor?: any;
              }
                ? Record<never, never> extends Omit<
                    inferProcedureInput<TProcedureOrRouter>,
                    'cursor'
                  >
                  ? undefined
                  :
                      | DeepPartial<
                          Omit<
                            inferProcedureInput<TProcedureOrRouter>,
                            'cursor'
                          >
                        >
                      | undefined
                :
                    | DeepPartial<inferProcedureInput<TProcedureOrRouter>>
                    | undefined,
              type?: QueryType,
            ],
      ]
    : TProcedureOrRouter extends AnyMutationProcedure
    ? [procedureOrRouter: DecorateProcedure<TProcedureOrRouter, TFlags, TPath>]
    : [
        procedureOrRouter: DecoratedProcedureRecord<
          TProcedureOrRouter['_def']['record'],
          TFlags,
          any
        >,
      ]
) {
  const [procedureOrRouter, input, type] = _params;
  // @ts-expect-error - we don't expose _def on the type layer
  const path = procedureOrRouter._def().path as string[];
  const dotPath = path.join('.');
  const queryKey = getArrayQueryKey(
    getQueryKeyInternal(dotPath, input),
    type ?? 'any',
  );
  return queryKey;
}
