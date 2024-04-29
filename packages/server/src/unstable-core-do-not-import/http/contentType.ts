import { TRPCError } from '../error/TRPCError';
import type { RootConfig } from '../rootConfig';
import { isObject, unsetMarker } from '../utils';

export type ContentTypeParser = {
  isBatchCall: boolean;
  calls: {
    path: string;
    /**
     * Read the raw input - will trigger reading the body and parsing the inputs
     */
    getRawInput: () => Promise<unknown>;
    /**
     * Get already parsed inputs - won't trigger reading the body or parsing the inputs
     */
    result: () => unknown;
  }[];
};
type ContentTypeHandler = {
  isMatch: (opts: Request) => boolean;
  parser: (opts: {
    path: string;
    req: Request;
    searchParams: URLSearchParams;
    config: RootConfig<any>;
  }) => ContentTypeParser;
};

/**
 * Memoize a function that takes no arguments
 * @internal
 */
function memo<TReturn>(fn: () => Promise<TReturn>) {
  let promise: Promise<TReturn> | null = null;
  let value: TReturn | typeof unsetMarker = unsetMarker;
  return {
    /**
     * Lazily read the value
     */
    async read(): Promise<TReturn> {
      if (value !== unsetMarker) {
        return value;
      }
      if (promise === null) {
        // dedupes promises and catches errors
        promise = fn().catch((cause) => {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: cause instanceof Error ? cause.message : 'Invalid input',
            cause,
          });
        });
      }

      value = await promise;
      promise = null;

      return value;
    },
    /**
     * Get an already stored result
     */
    result(): TReturn | undefined {
      return value !== unsetMarker ? value : undefined;
    },
  };
}

type InputRecord = Record<number, unknown>;

const jsonContentTypeHandler: ContentTypeHandler = {
  isMatch(req) {
    return !!req.headers.get('content-type')?.startsWith('application/json');
  },
  parser(opts) {
    const { req } = opts;
    const isBatchCall = opts.searchParams.get('batch') === '1';
    const paths = isBatchCall ? opts.path.split(',') : [opts.path];

    const getInputs = memo(async (): Promise<InputRecord> => {
      try {
        let inputs: unknown = undefined;
        if (req.method === 'GET') {
          const queryInput = opts.searchParams.get('input');
          if (queryInput) {
            inputs = JSON.parse(queryInput);
          }
        } else {
          inputs = await req.json();
        }
        if (inputs === undefined) {
          return {};
        }

        if (!isBatchCall) {
          return {
            0: opts.config.transformer.input.deserialize(inputs),
          };
        }

        if (!isObject(inputs)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '"input" needs to be an object when doing a batch call',
          });
        }
        const acc: InputRecord = {};
        for (const index of paths.keys()) {
          const input = inputs[index];
          if (input !== undefined) {
            acc[index] = opts.config.transformer.input.deserialize(input);
          }
        }

        return acc;
      } catch (cause) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: cause instanceof Error ? cause.message : 'Invalid input',
          cause,
        });
      }
    });

    return {
      isBatchCall,
      calls: paths.map((path, index) => ({
        path,
        getRawInput: async () => {
          const inputs = await getInputs.read();
          return inputs[index];
        },
        result: () => {
          return getInputs.result()?.[index];
        },
      })),
    };
  },
};

const formDataContentTypeHandler: ContentTypeHandler = {
  isMatch(req) {
    return !!req.headers.get('content-type')?.startsWith('multipart/form-data');
  },
  parser(opts) {
    const { req } = opts;
    if (req.method !== 'POST') {
      throw new TRPCError({
        code: 'METHOD_NOT_SUPPORTED',
        message:
          'Only POST requests are supported for multipart/form-data requests',
      });
    }
    const getInputs = memo(async () => {
      const fd = await req.formData();
      return fd;
    });
    return {
      calls: [
        {
          path: opts.path,
          getRawInput: () => getInputs.read(),
          result: () => getInputs.result(),
        },
      ],
      isBatchCall: false,
    };
  },
};

const octetStreamContentTypeHandler: ContentTypeHandler = {
  isMatch(req) {
    return !!req.headers
      .get('content-type')
      ?.startsWith('application/octet-stream');
  },
  parser(opts) {
    const { req } = opts;
    if (req.method !== 'POST') {
      throw new TRPCError({
        code: 'METHOD_NOT_SUPPORTED',
        message:
          'Only POST requests are supported for application/octet-stream requests',
      });
    }
    const getInputs = memo(async () => {
      return req.body;
    });
    return {
      calls: [
        {
          path: opts.path,
          getRawInput: () => getInputs.read(),
          result: () => getInputs.result(),
        },
      ],
      isBatchCall: false,
    };
  },
};

const handlers = [
  jsonContentTypeHandler,
  formDataContentTypeHandler,
  octetStreamContentTypeHandler,
];

export function getContentTypeHandler(req: Request): ContentTypeHandler {
  const handler = handlers.find((handler) => handler.isMatch(req));
  if (handler) {
    return handler;
  }

  if (!handler && req.method === 'GET') {
    return jsonContentTypeHandler;
  }

  throw new TRPCError({
    code: 'UNSUPPORTED_MEDIA_TYPE',
    message: req.headers.has('content-type')
      ? `Unsupported content-type "${req.headers.get('content-type')}`
      : 'Missing content-type header',
  });
}
