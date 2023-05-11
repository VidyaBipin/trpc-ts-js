import {
  AnyRouter,
  ProcedureType,
  callProcedure,
  inferRouterContext,
  inferRouterError,
} from '../core';
import { TRPCError, getTRPCErrorFromUnknown } from '../error/TRPCError';
import { TRPCResponse } from '../rpc';
import { transformTRPCResponse } from '../shared';
import { Maybe } from '../types';
import {
  BaseContentTypeHandler,
  getJsonContentTypeInputs,
} from './contentType';
import { getHTTPStatusCode } from './getHTTPStatusCode';
import { HTTPHeaders, HTTPResponse, ResponseChunk } from './internals/types';
import { HTTPBaseHandlerOptions, HTTPRequest } from './types';

const HTTP_METHOD_PROCEDURE_TYPE_MAP: Record<
  string,
  ProcedureType | undefined
> = {
  GET: 'query',
  POST: 'mutation',
};

const fallbackContentTypeHandler = {
  getInputs: getJsonContentTypeInputs,
};

interface ResolveHTTPRequestOptions<
  TRouter extends AnyRouter,
  TRequest extends HTTPRequest,
> extends HTTPBaseHandlerOptions<TRouter, TRequest> {
  createContext: () => Promise<inferRouterContext<TRouter>>;
  req: TRequest;
  path: string;
  error?: Maybe<TRPCError>;
  contentTypeHandler?: BaseContentTypeHandler<any>;
  preprocessedBody?: boolean;
}

function initResponse<TRouter extends AnyRouter, TRequest extends HTTPRequest>(
  ctx: inferRouterContext<TRouter> | undefined,
  paths: string[] | undefined,
  type:
    | Exclude<(typeof HTTP_METHOD_PROCEDURE_TYPE_MAP)[string], undefined>
    | 'unknown',
  responseMeta?: HTTPBaseHandlerOptions<TRouter, TRequest>['responseMeta'],
  untransformedJSON?:
    | TRPCResponse<unknown, inferRouterError<TRouter>>
    | TRPCResponse<unknown, inferRouterError<TRouter>>[]
    | undefined,
  errors: TRPCError[] = [],
): HTTPResponse {
  let status = untransformedJSON ? getHTTPStatusCode(untransformedJSON) : 200;
  const headers: HTTPHeaders = {
    'Content-Type': 'application/json',
  };

  const meta =
    responseMeta?.({
      ctx,
      paths,
      type,
      data: untransformedJSON
        ? Array.isArray(untransformedJSON)
          ? untransformedJSON
          : [untransformedJSON]
        : untransformedJSON,
      errors,
    }) ?? {};

  for (const [key, value] of Object.entries(meta.headers ?? {})) {
    headers[key] = value;
  }
  if (meta.status) {
    status = meta.status;
  }

  return {
    status,
    headers,
  };
}

async function inputToProcedureCall<
  TRouter extends AnyRouter,
  TRequest extends HTTPRequest,
>(
  opts: ResolveHTTPRequestOptions<TRouter, TRequest>,
  ctx: inferRouterContext<TRouter> | undefined,
  type: Exclude<
    (typeof HTTP_METHOD_PROCEDURE_TYPE_MAP)[string],
    undefined | 'subscription'
  >,
  inputs: Record<number, unknown>,
  path: string,
  index: number,
): Promise<
  [index: number, response: TRPCResponse<unknown, inferRouterError<TRouter>>]
> {
  const input = inputs[index];
  try {
    const data = await callProcedure({
      procedures: opts.router._def.procedures,
      path,
      rawInput: input,
      ctx,
      type,
    });
    return [
      index,
      {
        result: {
          data,
        },
      },
    ];
  } catch (cause) {
    const error = getTRPCErrorFromUnknown(cause);

    opts.onError?.({ error, path, input, ctx, type: type, req: opts.req });

    return [
      index,
      {
        error: opts.router.getErrorShape({
          error,
          type,
          path,
          input,
          ctx,
        }),
      },
    ];
  }
}

export async function* resolveHTTPResponse<
  TRouter extends AnyRouter,
  TRequest extends HTTPRequest,
>(opts: ResolveHTTPRequestOptions<TRouter, TRequest>) {
  const { router, req } = opts;

  if (req.method === 'HEAD') {
    // can be used for lambda warmup
    const headResponse: HTTPResponse = {
      status: 204,
    };
    yield headResponse;
    return;
  }
  const contentTypeHandler =
    opts.contentTypeHandler ?? fallbackContentTypeHandler;
  const batchingEnabled = opts.batching?.enabled ?? true;
  const streamingEnabled = opts.streaming?.enabled ?? true;
  const type =
    HTTP_METHOD_PROCEDURE_TYPE_MAP[req.method] ?? ('unknown' as const);
  let ctx: inferRouterContext<TRouter> | undefined = undefined;
  let paths: string[] | undefined;

  const isBatchCall = !!req.query.get('batch');
  const isStreamCall = isBatchCall && streamingEnabled;

  try {
    if (opts.error) {
      throw opts.error;
    }
    if (isBatchCall && !batchingEnabled) {
      throw new Error(`Batching is not enabled on the server`);
    }
    /* istanbul ignore if -- @preserve */
    if (type === 'subscription') {
      throw new TRPCError({
        message: 'Subscriptions should use wsLink',
        code: 'METHOD_NOT_SUPPORTED',
      });
    }
    if (type === 'unknown') {
      throw new TRPCError({
        message: `Unexpected request method ${req.method}`,
        code: 'METHOD_NOT_SUPPORTED',
      });
    }

    const inputs = await contentTypeHandler.getInputs({
      isBatchCall,
      req,
      router,
      preprocessedBody: opts.preprocessedBody ?? false,
    });

    paths = isBatchCall ? opts.path.split(',') : [opts.path];
    ctx = await opts.createContext();

    /**
     * when not streaming, do simple 2-step return
     */
    if (!isStreamCall || paths.length === 1) {
      // await all responses in parallel, blocking on the slowest
      const indexedResponses = await Promise.all(
        paths.map((path, index) =>
          inputToProcedureCall(opts, ctx, type, inputs, path, index),
        ),
      );
      const errors = indexedResponses.flatMap(([, response]) =>
        'error' in response ? [response.error] : [],
      );
      const untransformedJSON = indexedResponses.map(
        ([, response]) => response,
      );

      // yield header stuff
      yield initResponse(
        ctx,
        paths,
        type,
        opts.responseMeta,
        untransformedJSON,
        errors,
      );

      // return body stuff
      const transformedJSON = transformTRPCResponse(router, untransformedJSON);
      const body = JSON.stringify(transformedJSON);
      const chunk: ResponseChunk = [-1, body];
      return chunk;
    }

    /**
     * when not streaming, do simple 2-step return
     */

    // await / yield each response in parallel, blocking on none
    const promises = new Map(
      paths.map((path, index) => [
        index,
        Promise.resolve(
          inputToProcedureCall(opts, ctx, type, inputs, path, index),
        ),
      ]),
    );

    // yield minimal headers (cannot know the response body in advance)
    yield initResponse(ctx, paths, type, opts.responseMeta);
    for (let i = 0; i < paths.length; i++) {
      const [index, untransformedJSON] = await Promise.race(promises.values());
      promises.delete(index);
      const transformedJSON = transformTRPCResponse(router, untransformedJSON);
      const body = JSON.stringify(transformedJSON);
      const chunk: ResponseChunk = [index, body];
      yield chunk;
    }

    // return nothing, signalling the request handler to end the streamed response
    return;
  } catch (cause) {
    // we get here if
    // - batching is called when it's not enabled
    // - `createContext()` throws
    // - post body is too large
    // - input deserialization fails
    // - `errorFormatter` return value is malformed
    const error = getTRPCErrorFromUnknown(cause);

    opts.onError?.({
      error,
      path: undefined,
      input: undefined,
      ctx,
      type: type,
      req,
    });

    /**
     * same as for a non-streamed response, do simple 2-step return
     */

    const untransformedJSON = {
      error: router.getErrorShape({
        error,
        type,
        path: undefined,
        input: undefined,
        ctx,
      }),
    };

    // yield header stuff
    yield initResponse(ctx, paths, type, opts.responseMeta, untransformedJSON, [
      error,
    ]); // WARN: this can cause issues if streaming response has already yielded its headers, meaning that we need to be sure that `serialize` in `transformTRPCResponse` cannot throw

    // return body stuff
    const transformedJSON = transformTRPCResponse(router, untransformedJSON);
    const body = JSON.stringify(transformedJSON);
    const chunk: ResponseChunk = [-1, body];
    return chunk;
  }
}
