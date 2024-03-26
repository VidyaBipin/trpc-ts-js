import { isNotFoundError } from 'next/dist/client/components/not-found';
import { isRedirectError } from 'next/dist/client/components/redirect';
import { getTRPCErrorFromUnknown, TRPCError } from '../@trpc/server';
// FIXME: fix lint rule, this is ok
// eslint-disable-next-line no-restricted-imports
import type { ErrorHandlerOptions } from '../unstable-core-do-not-import/procedure';
// FIXME: fix lint rule, this is ok
// eslint-disable-next-line no-restricted-imports
import type { CallerOverride } from '../unstable-core-do-not-import/procedureBuilder';
// FIXME: fix lint rule, this is ok
// eslint-disable-next-line no-restricted-imports
import type {
  MaybePromise,
  Simplify,
} from '../unstable-core-do-not-import/types';
import { formDataToObject } from './next-app-dir/formDataToObject';

type ContextCallback<TContext> = object extends TContext
  ? {
      createContext?: () => MaybePromise<TContext>;
    }
  : {
      createContext: () => MaybePromise<TContext>;
    };

const throwNextErrors = (error: TRPCError) => {
  const { cause } = error;
  if (isRedirectError(cause) || isNotFoundError(cause)) {
    throw error.cause;
  }
};
export function experimental_nextAppDirCaller<TContext>(
  config: Simplify<
    {
      /**
       * Transform form data to a `Record` before passing it to the procedure
       * @default true
       */
      normalizeFormData?: boolean;

      /**
       * Rethrow errors that should be handled by Next.js
       */
      rethrowNextErrors?: boolean;
      /**
       * Called when an error occurs in the handler
       */
      onError?: (opts: ErrorHandlerOptions<TContext>) => void;
    } & ContextCallback<TContext>
  >,
): CallerOverride<TContext> {
  const { normalizeFormData = true } = config;
  const createContext = async (): Promise<TContext> => {
    return config?.createContext?.() ?? ({} as TContext);
  };
  return async (opts) => {
    const ctx: TContext = await createContext().catch((cause) => {
      const error = new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create context',
        cause,
      });

      throw error;
    });

    const handleError = (cause: unknown) => {
      const error = getTRPCErrorFromUnknown(cause);

      config.onError?.({
        ctx,
        error,
        input: opts.args[0],
        path: '',
        type: opts._def.type,
      });

      if (config.rethrowNextErrors) {
        throwNextErrors(error);
      }

      throw error;
    };
    switch (opts._def.type) {
      case 'mutation': {
        /**
         * When you wrap an action with useFormState, it gets an extra argument as its first argument.
         * The submitted form data is therefore its second argument instead of its first as it would usually be.
         * The new first argument that gets added is the current state of the form.
         * @see https://react.dev/reference/react-dom/hooks/useFormState#my-action-can-no-longer-read-the-submitted-form-data
         */
        let input = opts.args.length === 1 ? opts.args[0] : opts.args[1];
        if (normalizeFormData && input instanceof FormData) {
          input = formDataToObject(input);
        }

        return await opts
          .invoke({
            type: 'mutation',
            ctx,
            getRawInput: async () => input,
            path: '',
            input,
          })
          .catch(handleError);
      }
      case 'query': {
        const input = opts.args[0];
        return await opts
          .invoke({
            type: 'query',
            ctx,
            getRawInput: async () => input,
            path: '',
            input,
          })
          .catch(handleError);
      }
      default: {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: `Not implemented for type ${opts._def.type}`,
        });
      }
    }
  };
}
