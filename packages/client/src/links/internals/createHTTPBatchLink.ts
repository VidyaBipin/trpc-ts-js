import { AnyRouter, ProcedureType } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { dataLoader } from '../../internals/dataLoader';
import { transformResult } from '../../shared/transformResult';
import { TRPCClientError } from '../../TRPCClientError';
import { HTTPBatchLinkOptions } from '../HTTPBatchLinkOptions';
import { CancelFn, Operation, TRPCClientRuntime, TRPCLink } from '../types';
import {
  getUrl,
  HTTPResult,
  ResolvedHTTPLinkOptions,
  resolveHTTPLinkOptions,
} from './httpUtils';

/**
 * @internal
 */
export type RequesterFn = (
  requesterOpts: ResolvedHTTPLinkOptions & {
    runtime: TRPCClientRuntime;
    type: ProcedureType;
    opts: HTTPBatchLinkOptions;
  },
) =>
  (
    batchOps: Operation[],
    unitResolver: (index: number, value: NonNullable<HTTPResult>) => void,
    batchComplete: () => void,
  ) => {
    promise: Promise<HTTPResult[]>;
    cancel: CancelFn;
  };

/**
 * @internal
 */
export function createHTTPBatchLink(requester: RequesterFn) {
  return function httpBatchLink<TRouter extends AnyRouter>(
    opts: HTTPBatchLinkOptions,
  ): TRPCLink<TRouter> {
    const resolvedOpts = resolveHTTPLinkOptions(opts);
    const maxURLLength = opts.maxURLLength || Infinity;

    // initialized config
    return (runtime) => {
      const batchLoader = (type: ProcedureType) => {
        const validate = (batchOps: Operation[]) => {
          if (maxURLLength === Infinity) {
            // escape hatch for quick calcs
            return true;
          }
          const path = batchOps.map((op) => op.path).join(',');
          const inputs = batchOps.map((op) => op.input);

          const url = getUrl({
            ...resolvedOpts,
            runtime,
            type,
            path,
            inputs,
          });

          return url.length <= maxURLLength;
        };

        const fetch = requester({
          ...resolvedOpts,
          runtime,
          type,
          opts,
        });

        return { validate, fetch };
      };

      const query = dataLoader<Operation, HTTPResult>(batchLoader('query'));
      const mutation = dataLoader<Operation, HTTPResult>(
        batchLoader('mutation'),
      );
      const subscription = dataLoader<Operation, HTTPResult>(
        batchLoader('subscription'),
      );

      const loaders = { query, subscription, mutation, queryGenerator: query, mutationGenerator: mutation };
      return ({ op }) => {
        // eslint-disable-next-line no-console
        console.log("Firing op", op);
        return observable((observer) => {
          const loader = loaders[op.type];

          if (!op.type.endsWith("Generator")) {
            const { promise, cancel } = loader.load(op);

            promise
              .then((res) => {
                const transformed = transformResult(res.json, runtime);

                if (!transformed.ok) {
                  observer.error(
                    TRPCClientError.from(transformed.error, {
                      meta: res.meta,
                    }),
                  );
                  return;
                }
                observer.next({
                  context: res.meta,
                  result: transformed.result,
                });
                observer.complete();
              })
              .catch((err) => observer.error(TRPCClientError.from(err)));

            return () => cancel();
          } else {
            // eslint-disable-next-line no-console
            console.log("Calling loadgenerator", op.path);
            const { generator, cancel } = loader.loadGenerator(op);

            (async () => {
              for await (const res of generator) {
                // eslint-disable-next-line no-console
                console.log("In batch link", res, op.path);
                const transformed = transformResult(res.json, runtime);

                if (!transformed.ok) {
                  observer.error(
                    TRPCClientError.from(transformed.error, {
                      meta: res.meta,
                    }),
                  );
                  return;
                }
                observer.next({
                  context: res.meta,
                  result: transformed.result,
                });
                // eslint-disable-next-line no-console
                console.log("Getting another batch link", op.path);
              }
              observer.complete();
            })()
              .catch((err) => observer.error(TRPCClientError.from(err)));

            return () => cancel();
          }
        });
      };
    };
  };
}
