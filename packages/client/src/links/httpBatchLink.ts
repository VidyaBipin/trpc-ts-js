import { AnyRouter, ProcedureType } from '@trpc/server';
import { observable } from '@trpc/server/observable';
import { dataLoader } from '../internals/dataLoader';
import {
  HTTPLinkOptions,
  ResponseShape,
  getUrl,
  httpRequest,
} from './internals/httpUtils';
import { OperationResult, TRPCLink } from "./types";
import { transformOperationResult } from "./internals/transformOperationResult";

export interface HttpBatchLinkOptions extends HTTPLinkOptions {
  maxURLLength?: number;
}

export function httpBatchLink<TRouter extends AnyRouter>(
  opts: HttpBatchLinkOptions,
): TRPCLink<TRouter> {
  // initialized config
  return (runtime) => {
    type BatchOperation = { id: number; path: string; input: unknown };

    const maxURLLength = opts.maxURLLength || Infinity;

    const batchLoader = (type: ProcedureType) => {
      const validate = (batchOps: BatchOperation[]) => {
        if (maxURLLength === Infinity) {
          // escape hatch for quick calcs
          return true;
        }
        const path = batchOps.map((op) => op.path).join(',');
        const inputs = batchOps.map((op) => op.input);

        const url = getUrl({ url: opts.url, runtime, type, path, inputs });
        return url.length <= maxURLLength;
      };

      const fetch = (batchOps: BatchOperation[]) => {
        const path = batchOps.map((op) => op.path).join(',');
        const inputs = batchOps.map((op) => op.input);

        const { promise, cancel } = httpRequest({
          url: opts.url,
          runtime,
          type,
          path,
          inputs,
        });

        return {
          promise: promise.then((res) => {
            const resJSON = Array.isArray(res.json)
              ? res.json
              : batchOps.map(() => res.json);

            const result = resJSON.map((item) => ({
              meta: res.meta,
              json: item,
            }));

            return result;
          }),
          cancel,
        };
      };

      return { validate, fetch };
    };

    const query = dataLoader<BatchOperation, ResponseShape>(
      batchLoader('query'),
    );
    const mutation = dataLoader<BatchOperation, ResponseShape>(
      batchLoader('mutation'),
    );
    const subscription = dataLoader<BatchOperation, ResponseShape>(
      batchLoader('subscription'),
    );

    const loaders = { query, subscription, mutation };
    return ({ op }) => {
      return observable((observer) => {
        const loader = loaders[op.type];
        const { promise, cancel } = loader.load(op);

        promise
          .then((res) => {
            const result = { context: res.meta, data: res.json } as OperationResult<TRouter, any>;
            const transformed = transformOperationResult(result, runtime);
            if (transformed.ok) {
              observer.next({
                context: res.meta,
                data: res.json as any,
              });
            } else {
              observer.error(transformed.error);
            }
            observer.complete();
          })
          .catch((err) => observer.error(err as any));

        return () => {
          cancel();
        };
      });
    };
  };
}
