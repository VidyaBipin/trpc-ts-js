import { AnyRouter, inferRouterError, Maybe } from '@trpc/server';
import { TRPCErrorResponse } from '@trpc/server/rpc';

export interface TRPCClientErrorLike<TRouter extends AnyRouter> {
  readonly message: string;
  readonly shape: Maybe<inferRouterError<TRouter>>;
  readonly data: Maybe<inferRouterError<TRouter>['data']>;
}

export class TRPCClientError<TRouter extends AnyRouter>
  extends Error
  implements TRPCClientErrorLike<TRouter>
{
  /**
   * @deprecated use `cause`
   */
  public readonly originalError;
  public readonly cause;
  public readonly shape: Maybe<inferRouterError<TRouter>>;
  public readonly data: Maybe<inferRouterError<TRouter>['data']>;
  /**
   * Fatal error - expect no more results after this error
   * Used for when WebSockets disconnect prematurely.
   */
  public readonly isDone: boolean;

  constructor(
    message: string,
    {
      originalError,
      isDone = false,
      result,
      cause,
    }: {
      result: Maybe<TRPCErrorResponse<inferRouterError<TRouter>>>;
      /**
       * @deprecated use cause
       **/
      originalError?: Maybe<Error>;
      cause?: Maybe<Error>;
      isDone?: boolean;
    },
  ) {
    super(message);
    this.isDone = isDone;
    this.message = message;
    this.cause = this.originalError = cause ?? originalError;
    this.shape = result?.error;
    this.data = result?.error.data;
    this.name = 'TRPCClientError';

    Object.setPrototypeOf(this, TRPCClientError.prototype);
  }

  public static from<TRouter extends AnyRouter>(
    result: Error | TRPCErrorResponse<any>,
    opts: { isDone?: boolean } = {},
  ): TRPCClientError<TRouter> {
    if (!(result instanceof Error)) {
      return new TRPCClientError<TRouter>((result.error as any).message ?? '', {
        ...opts,
        cause: null,
        result: result,
      });
    }
    if (result.name === 'TRPCClientError') {
      return result as TRPCClientError<any>;
    }

    return new TRPCClientError<TRouter>(result.message, {
      ...opts,
      cause: result,
      result: null,
    });
  }
}
