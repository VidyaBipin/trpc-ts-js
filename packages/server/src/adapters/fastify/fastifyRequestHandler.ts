import { FastifyReply, FastifyRequest } from 'fastify';
import { Readable } from 'node:stream';
import { AnyRouter, inferRouterContext } from '../../core';
import { HTTPBaseHandlerOptions, HTTPRequest } from '../../http';
import { HTTPResponse, ResponseChunk } from '../../http/internals/types';
import { resolveHTTPResponse } from '../../http/resolveHTTPResponse';
import { NodeHTTPCreateContextOption } from '../node-http';

export type FastifyHandlerOptions<
  TRouter extends AnyRouter,
  TRequest extends FastifyRequest,
  TResponse extends FastifyReply,
> = HTTPBaseHandlerOptions<TRouter, TRequest> &
  NodeHTTPCreateContextOption<TRouter, TRequest, TResponse>;

type FastifyRequestHandlerOptions<
  TRouter extends AnyRouter,
  TRequest extends FastifyRequest,
  TResponse extends FastifyReply,
> = {
  req: TRequest;
  res: TResponse;
  path: string;
} & FastifyHandlerOptions<TRouter, TRequest, TResponse>;

export async function fastifyRequestHandler<
  TRouter extends AnyRouter,
  TRequest extends FastifyRequest,
  TResponse extends FastifyReply,
>(opts: FastifyRequestHandlerOptions<TRouter, TRequest, TResponse>) {
  const createContext = async function _createContext(): Promise<
    inferRouterContext<TRouter>
  > {
    return opts.createContext?.(opts);
  };

  const query = opts.req.query
    ? new URLSearchParams(opts.req.query as any)
    : new URLSearchParams(opts.req.url.split('?')[1]);

  const req: HTTPRequest = {
    query,
    method: opts.req.method,
    headers: opts.req.headers,
    body: opts.req.body ?? 'null',
  };

  const resultIterator = resolveHTTPResponse({
    req,
    createContext,
    path: opts.path,
    router: opts.router,
    batching: opts.batching,
    responseMeta: opts.responseMeta,
    onError(o) {
      opts?.onError?.({ ...o, req: opts.req });
    },
  });

  return iteratorToResponse(resultIterator, opts.res);
}

/**
 * @internal
 */
export async function iteratorToResponse(
  iterator: AsyncGenerator<
    ResponseChunk | HTTPResponse,
    ResponseChunk | undefined
  >,
  res: FastifyReply,
): Promise<FastifyReply> {
  const { value: responseInit, done: invalidInit } = await (
    iterator as AsyncGenerator<HTTPResponse, HTTPResponse | undefined>
  ).next();
  const { value: firstChunk, done: abort } = await (
    iterator as AsyncGenerator<ResponseChunk, ResponseChunk | undefined>
  ).next();

  if (invalidInit || (abort && !firstChunk)) {
    res.statusCode = 500;
    return res.send();
  }
  if ('status' in responseInit && (!res.statusCode || res.statusCode === 200)) {
    res.statusCode = responseInit.status;
  }
  for (const [key, value] of Object.entries(responseInit.headers ?? {})) {
    /* istanbul ignore if -- @preserve */
    if (typeof value === 'undefined') {
      continue;
    }
    void res.header(key, value);
  }

  // iterator is already exhausted, this means we're not streaming the response
  if (abort) {
    if (firstChunk) {
      // case of a full response
      return res.send(firstChunk[1]);
    } else {
      // case of a method === "HEAD" response
      return res.send();
    }
  }

  // iterator is not exhausted, we can setup the streamed response
  void res.header('Transfer-Encoding', 'chunked');
  void res.header(
    'Vary',
    res.hasHeader('Vary')
      ? 'x-trpc-batch-mode, ' + res.getHeader('Vary')
      : 'x-trpc-batch-mode',
  );
  const readableStream = new Readable();
  readableStream._read = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function -- https://github.com/fastify/fastify/issues/805#issuecomment-369172154
  const sendPromise = res.send(readableStream);
  void sendChunkedResponse(
    readableStream,
    firstChunk,
    iterator as AsyncGenerator<ResponseChunk, ResponseChunk | undefined>,
  );

  return sendPromise;
}

async function sendChunkedResponse(
  stream: Readable,
  firstChunk: ResponseChunk,
  resultIterator: AsyncGenerator<ResponseChunk, ResponseChunk | undefined>,
) {
  stream.push('{\n');

  // each procedure body will be written on a new line of the JSON so they can be parsed independently
  let first = true;
  const sendChunk = ([index, body]: [number, string]) => {
    const comma = first ? '' : ',';
    first = false;
    stream.push(`${comma}"${index}":${body}\n`);
  };

  // await every procedure
  sendChunk(firstChunk);
  for await (const chunk of resultIterator) {
    sendChunk(chunk);
  }

  // finalize response
  stream.push('}');
  stream.push(null); // https://github.com/fastify/fastify/issues/805#issuecomment-369172154
}
