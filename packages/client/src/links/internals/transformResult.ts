import { AnyRouter, inferRouterError } from '@trpc/server';
import {
  TRPCResponse,
  TRPCResponseMessage,
  TRPCResultMessage,
} from '@trpc/server/rpc';
import { TRPCClientRuntime } from '..';
import { TRPCClientError } from '../../TRPCClientError';

// FIXME:
// - the generics here are probably unnecessary
// - the RPC-spec could probably be simplified to combine HTTP + WS
/** @internal */
function transformResult<TRouter extends AnyRouter, TOutput>(
  response:
    | TRPCResponseMessage<TOutput, inferRouterError<TRouter>>
    | TRPCResponse<TOutput, inferRouterError<TRouter>>,
  runtime: TRPCClientRuntime,
) {
  if ('error' in response) {
    const error = runtime.transformer.deserialize(
      response.error,
    ) as inferRouterError<TRouter>;
    return {
      ok: false,
      error: {
        ...response,
        error,
      },
    } as const;
  }

  const result = {
    ...response.result,
    ...((!response.result.type || response.result.type === 'data') && {
      type: 'data',
      data: runtime.transformer.deserialize(response.result.data),
    }),
  } as TRPCResultMessage<TOutput>['result'];
  return { ok: true, result } as const;
}

function isObject(value: unknown): value is Record<string, unknown> {
  // check that value is object
  return !!value && !Array.isArray(value) && typeof value === 'object';
}

export function transformResultSafe<TRouter extends AnyRouter, TOutput>(
  response:
    | TRPCResponseMessage<TOutput, inferRouterError<TRouter>>
    | TRPCResponse<TOutput, inferRouterError<TRouter>>,
  runtime: TRPCClientRuntime,
): ReturnType<typeof transformResult> {
  let result: ReturnType<typeof transformResult>;
  try {
    // Use the data transformers on the JSON-response
    result = transformResult(response, runtime);
  } catch (err) {
    throw new TRPCClientError('Unable to transform response from server');
  }

  // check that output of the transformers is a valid TRPCResponse
  if (
    !result.ok &&
    (!isObject(result.error.error) ||
      typeof result.error.error.code !== 'number')
  ) {
    throw new TRPCClientError('Badly formatted response from server');
  }
  if (result.ok && !isObject(result.result)) {
    throw new TRPCClientError('Badly formatted response from server');
  }
  return result;
}
