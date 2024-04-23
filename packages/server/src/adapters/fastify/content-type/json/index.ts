// @trpc/server
import type { FastifyReply, FastifyRequest } from 'fastify';
import { TRPCError } from '../../../../@trpc/server';
import type {
  AnyRouter,
  CombinedDataTransformer,
} from '../../../../@trpc/server';
import type { BaseContentTypeHandler } from '../../../../@trpc/server/http';
import { createConcurrentCache } from '../../../content-handlers/concurrentCache';
import type { FastifyRequestHandlerOptions } from '../../types';

export interface FastifyHTTPContentTypeHandler<
  TRouter extends AnyRouter,
  TRequest extends FastifyRequest,
  TResponse extends FastifyReply,
> extends BaseContentTypeHandler<
    FastifyRequestHandlerOptions<TRouter, TRequest, TResponse>
  > {}

export const getFastifyHTTPJSONContentTypeHandler: <
  TRouter extends AnyRouter,
  TRequest extends FastifyRequest,
  TResponse extends FastifyReply,
>() => FastifyHTTPContentTypeHandler<TRouter, TRequest, TResponse> = () => {
  const cache = createConcurrentCache();

  return {
    name: 'fastify-json',
    isMatch: (headers) => {
      return !!headers.get('content-type')?.startsWith('application/json');
    },
    getInputs: async (opts, info) => {
      async function getRawProcedureInputOrThrow() {
        const { req } = opts;

        try {
          if (req.method === 'GET') {
            const query = opts.req.query
              ? new URLSearchParams(opts.req.query as any)
              : new URLSearchParams(opts.req.url.split('?')[1]);

            const input = query.get('input');
            if (!input) {
              return undefined;
            }

            return JSON.parse(input);
          }

          const body = opts.req.body ?? 'null';
          if (typeof body === 'string') {
            // A mutation with no inputs will have req.body === ''
            return body.length === 0 ? undefined : JSON.parse(body);
          }

          return body;
        } catch (cause) {
          throw new TRPCError({
            code: 'PARSE_ERROR',
            cause,
          });
        }
      }

      const deserializeInputValue = (
        rawValue: unknown,
        transformer: CombinedDataTransformer,
      ) => {
        return typeof rawValue !== 'undefined'
          ? transformer.input.deserialize(rawValue)
          : rawValue;
      };

      const rawInput = await cache.concurrentSafeGet('rawInput', () =>
        getRawProcedureInputOrThrow(),
      );
      if (rawInput === undefined) {
        return undefined;
      }

      const transformer = opts.router._def._config.transformer;

      if (!info.isBatchCall) {
        return cache.concurrentSafeGet('input', () =>
          deserializeInputValue(rawInput, transformer),
        );
      }

      /* istanbul ignore if  */
      if (
        rawInput == null ||
        typeof rawInput !== 'object' ||
        Array.isArray(rawInput)
      ) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '"input" needs to be an object when doing a batch call',
        });
      }

      return cache.concurrentSafeGet(String(info.batch), () =>
        deserializeInputValue(rawInput[info.batch], transformer),
      );
    },
  };
};
