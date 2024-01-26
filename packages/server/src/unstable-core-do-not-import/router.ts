import { createRecursiveProxy } from './createProxy';
import { defaultFormatter } from './error/formatter';
import { TRPCError } from './error/TRPCError';
import type {
  AnyProcedure,
  inferProcedureInput,
  inferTransformedProcedureOutput,
} from './procedure';
import type { ProcedureCallOptions } from './procedureBuilder';
import type { AnyRootTypes, RootConfig } from './rootConfig';
import { defaultTransformer } from './transformer';
import type { MaybePromise } from './types';
import { mergeWithoutOverrides, omitPrototype } from './utils';

/** @internal **/
export type ProcedureRecord = Record<string, AnyProcedure>;

export interface ProcedureRouterRecord {
  [key: string]: AnyProcedure | AnyRouter;
}

type DecorateProcedure<TProcedure extends AnyProcedure> = (
  input: inferProcedureInput<TProcedure>,
) => Promise<TProcedure['_def']['_output_out']>;

/**
 * @internal
 */
type DecoratedProcedureRecord<TProcedures extends ProcedureRouterRecord> = {
  [TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
    ? DecoratedProcedureRecord<TProcedures[TKey]['_def']['record']>
    : TProcedures[TKey] extends AnyProcedure
    ? DecorateProcedure<TProcedures[TKey]>
    : never;
};

/**
 * @internal
 */
export type RouterCaller<
  TRoot extends AnyRootTypes,
  TRecord extends ProcedureRouterRecord,
> = (
  /**
   * @note
   * If passing a function, we recommend it's a cached function
   * e.g. wrapped in `React.cache` to avoid unnecessary computations
   */
  ctx: TRoot['ctx'] | (() => MaybePromise<TRoot['ctx']>),
) => DecoratedProcedureRecord<TRecord>;

export interface Router<
  TRoot extends AnyRootTypes,
  TRecord extends ProcedureRouterRecord,
> {
  _def: {
    _config: RootConfig<TRoot>;
    router: true;
    procedure?: never;
    procedures: TRecord;
    record: TRecord;
  };
  /**
   * @deprecated use `t.createCallerFactory(router)` instead
   * @link https://trpc.io/docs/v11/server/server-side-calls
   */
  createCaller: RouterCaller<TRoot, TRecord>;
}

export type BuiltRouter<
  TRoot extends AnyRootTypes,
  TRecord extends ProcedureRouterRecord,
> = Router<TRoot, TRecord> & TRecord;

export type AnyRouter = Router<any, any>;

type inferRouterRootTypes<TRouter extends AnyRouter> =
  TRouter['_def']['_config']['$types'];

export type inferRouterContext<TRouter extends AnyRouter> =
  inferRouterRootTypes<TRouter>['ctx'];
export type inferRouterError<TRouter extends AnyRouter> =
  inferRouterRootTypes<TRouter>['errorShape'];
export type inferRouterMeta<TRouter extends AnyRouter> =
  inferRouterRootTypes<TRouter>['meta'];

export type GetInferenceHelpers<
  TType extends 'input' | 'output',
  TRouter extends AnyRouter,
> = {
  [TKey in keyof TRouter['_def']['record']]: TRouter['_def']['record'][TKey] extends infer TRouterOrProcedure
    ? TRouterOrProcedure extends AnyRouter
      ? GetInferenceHelpers<TType, TRouterOrProcedure>
      : TRouterOrProcedure extends AnyProcedure
      ? TType extends 'input'
        ? inferProcedureInput<TRouterOrProcedure>
        : inferTransformedProcedureOutput<TRouter, TRouterOrProcedure>
      : never
    : never;
};

export type inferRouterInputs<TRouter extends AnyRouter> = GetInferenceHelpers<
  'input',
  TRouter
>;

export type inferRouterOutputs<TRouter extends AnyRouter> = GetInferenceHelpers<
  'output',
  TRouter
>;

function isRouter(
  procedureOrRouter: AnyProcedure | AnyRouter,
): procedureOrRouter is AnyRouter {
  return 'router' in procedureOrRouter._def;
}

const emptyRouter = {
  _ctx: null as any,
  _errorShape: null as any,
  _meta: null as any,
  queries: {},
  mutations: {},
  subscriptions: {},
  errorFormatter: defaultFormatter,
  transformer: defaultTransformer,
};

/**
 * Reserved words that can't be used as router or procedure names
 */
const reservedWords = [
  /**
   * Then is a reserved word because otherwise we can't return a promise that returns a Proxy
   * since JS will think that `.then` is something that exists
   */
  'then',
];

/**
 * @internal
 */
export function createRouterFactory<TRoot extends AnyRootTypes>(
  config: RootConfig<TRoot>,
) {
  return function createRouterInner<
    TProcRouterRecord extends ProcedureRouterRecord,
  >(procedures: TProcRouterRecord): BuiltRouter<TRoot, TProcRouterRecord> {
    const reservedWordsUsed = new Set(
      Object.keys(procedures).filter((v) => reservedWords.includes(v)),
    );
    if (reservedWordsUsed.size > 0) {
      throw new Error(
        'Reserved words used in `router({})` call: ' +
          Array.from(reservedWordsUsed).join(', '),
      );
    }

    const routerProcedures: ProcedureRecord = omitPrototype({});
    function recursiveGetPaths(procedures: ProcedureRouterRecord, path = '') {
      for (const [key, procedureOrRouter] of Object.entries(procedures ?? {})) {
        const newPath = `${path}${key}`;

        if (isRouter(procedureOrRouter)) {
          recursiveGetPaths(procedureOrRouter._def.procedures, `${newPath}.`);
          continue;
        }

        if (routerProcedures[newPath]) {
          throw new Error(`Duplicate key: ${newPath}`);
        }

        routerProcedures[newPath] = procedureOrRouter;
      }
    }
    recursiveGetPaths(procedures);

    const _def: AnyRouter['_def'] = {
      _config: config,
      router: true,
      procedures: routerProcedures,
      ...emptyRouter,
      record: procedures,
    };

    const router: AnyRouter = {
      ...procedures,
      _def,
      createCaller(ctx) {
        const proxy = createRecursiveProxy(({ path, args }) => {
          const fullPath = path.join('.');
          const procedure = _def.procedures[fullPath] as AnyProcedure;

          return procedure({
            path: fullPath,
            getRawInput: async () => args[0],
            ctx,
            type: procedure._def.type,
          });
        });

        return proxy as ReturnType<RouterCaller<any, any>>;
      },
    };

    return router as Router<TRoot, TProcRouterRecord> & TProcRouterRecord;
  };
}

function isProcedure(
  procedureOrRouter: AnyProcedure | AnyRouter,
): procedureOrRouter is AnyProcedure {
  return !!procedureOrRouter._def.procedure;
}
/**
 * @internal
 */
export function callProcedure(
  opts: ProcedureCallOptions & { procedures: ProcedureRouterRecord },
) {
  const { type, path } = opts;
  const proc = opts.procedures[path];
  if (!proc || !isProcedure(proc) || proc._def.type !== type) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: `No "${type}"-procedure on path "${path}"`,
    });
  }

  return proc(opts);
}

export function createCallerFactory<TRoot extends AnyRootTypes>() {
  return function createCallerInner<TRecord extends ProcedureRouterRecord>(
    router: Router<TRoot, TRecord>,
  ): RouterCaller<TRoot, TRecord> {
    const _def = router._def;
    type Context = TRoot['ctx'];

    return function createCaller(maybeContext) {
      const proxy = createRecursiveProxy(({ path, args }) => {
        const fullPath = path.join('.');

        const procedure = _def.procedures[fullPath] as AnyProcedure;

        const callProc = (ctx: Context) =>
          procedure({
            path: fullPath,
            getRawInput: async () => args[0],
            ctx,
            type: procedure._def.type,
          });

        if (typeof maybeContext === 'function') {
          const context = (maybeContext as () => MaybePromise<Context>)();
          if (context instanceof Promise) {
            return context.then(callProc);
          }
          return callProc(context);
        }

        return callProc(maybeContext);
      });

      return proxy as ReturnType<RouterCaller<any, any>>;
    };
  };
}

/** @internal */
type MergeRouters<
  TRouters extends AnyRouter[],
  TRoot extends AnyRootTypes = TRouters[0]['_def']['_config']['$types'],
  // eslint-disable-next-line @typescript-eslint/ban-types
  TRecord extends ProcedureRouterRecord = {},
> = TRouters extends [
  infer Head extends AnyRouter,
  ...infer Tail extends AnyRouter[],
]
  ? MergeRouters<Tail, TRoot, Head['_def']['record'] & TRecord>
  : BuiltRouter<TRoot, TRecord>;

export function mergeRouters<TRouters extends AnyRouter[]>(
  ...routerList: [...TRouters]
): MergeRouters<TRouters> {
  const record = mergeWithoutOverrides(
    {},
    ...routerList.map((r) => r._def.record),
  );
  const errorFormatter = routerList.reduce(
    (currentErrorFormatter, nextRouter) => {
      if (
        nextRouter._def._config.errorFormatter &&
        nextRouter._def._config.errorFormatter !== defaultFormatter
      ) {
        if (
          currentErrorFormatter !== defaultFormatter &&
          currentErrorFormatter !== nextRouter._def._config.errorFormatter
        ) {
          throw new Error('You seem to have several error formatters');
        }
        return nextRouter._def._config.errorFormatter;
      }
      return currentErrorFormatter;
    },
    defaultFormatter,
  );

  const transformer = routerList.reduce((prev, current) => {
    if (
      current._def._config.transformer &&
      current._def._config.transformer !== defaultTransformer
    ) {
      if (
        prev !== defaultTransformer &&
        prev !== current._def._config.transformer
      ) {
        throw new Error('You seem to have several transformers');
      }
      return current._def._config.transformer;
    }
    return prev;
  }, defaultTransformer);

  const router = createRouterFactory({
    errorFormatter,
    transformer,
    isDev: routerList.some((r) => r._def._config.isDev),
    allowOutsideOfServer: routerList.some(
      (r) => r._def._config.allowOutsideOfServer,
    ),
    isServer: routerList.some((r) => r._def._config.isServer),
    $types: routerList[0]?._def._config.$types,
  })(record);

  return router as MergeRouters<TRouters>;
}
