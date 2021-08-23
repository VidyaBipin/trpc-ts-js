/**
 * Heavily based on urql's ssr
 * https://github.com/FormidableLabs/urql/blob/main/packages/next-urql/src/with-urql-client.ts
 */

import {
  createReactQueryHooks,
  createTRPCClient,
  CreateTRPCClientOptions,
  TRPCClient,
  TRPCClientError,
} from '@trpc/react';
import type { AnyRouter, Dict } from '@trpc/server';
import {
  AppContextType,
  AppPropsType,
  NextComponentType,
  NextPageContext,
} from 'next/dist/shared/lib/utils';
import React, { createElement, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { dehydrate, Hydrate } from 'react-query/hydration';
import ssrPrepass from 'react-ssr-prepass';

type QueryClientConfig = ConstructorParameters<typeof QueryClient>[0];

export type WithTRPCConfig<TRouter extends AnyRouter> =
  CreateTRPCClientOptions<TRouter> & {
    queryClientConfig?: QueryClientConfig;
  };

export function withTRPC<TRouter extends AnyRouter>(
  opts: {
    config: (info: { ctx?: NextPageContext }) => WithTRPCConfig<TRouter>;
  } & (
    | {
        ssr?: false;
      }
    | {
        ssr: true;
        responseHeaders?: (opts: {
          ctx: NextPageContext;
          clientErrors: TRPCClientError<TRouter>[];
        }) => Dict<string>;
      }
  ),
) {
  const { config: getClientConfig } = opts;
  type TRPCPrepassProps = {
    config: WithTRPCConfig<TRouter>;
    queryClient: QueryClient;
    trpcClient: TRPCClient<TRouter>;
    isPrepass: true;
    ssrContext: NextPageContext;
  };
  return (AppOrPage: NextComponentType<any, any, any>): NextComponentType => {
    const trpc = createReactQueryHooks<TRouter>();

    const WithTRPC = (
      props: AppPropsType & {
        trpc?: TRPCPrepassProps;
      },
    ) => {
      const [{ queryClient, trpcClient, isPrepass, ssrContext }] = useState(
        () => {
          if (props.trpc) {
            return props.trpc;
          }
          const config = getClientConfig({});
          const queryClient = new QueryClient(config.queryClientConfig);
          const trpcClient = trpc.createClient(config);
          return {
            queryClient,
            trpcClient,
            isPrepass: false,
            ssrContext: undefined,
          };
        },
      );

      const hydratedState = trpc.useDehydratedState(
        trpcClient,
        props.pageProps?.trpcState,
      );

      return (
        <trpc.Provider
          client={trpcClient}
          queryClient={queryClient}
          isPrepass={isPrepass}
          ssrContext={ssrContext}
        >
          <QueryClientProvider client={queryClient}>
            <Hydrate state={hydratedState}>
              <AppOrPage {...props} />
            </Hydrate>
          </QueryClientProvider>
        </trpc.Provider>
      );
    };

    if (AppOrPage.getInitialProps || opts.ssr) {
      WithTRPC.getInitialProps = async (appOrPageCtx: AppContextType) => {
        const AppTree = appOrPageCtx.AppTree;

        // Determine if we are wrapping an App component or a Page component.
        const isApp = !!appOrPageCtx.Component;
        const ctx: NextPageContext = isApp
          ? appOrPageCtx.ctx
          : (appOrPageCtx as any as NextPageContext);
        const isServer = typeof window === 'undefined' && opts.ssr;

        // Run the wrapped component's getInitialProps function.
        let pageProps: Dict<unknown> = {};
        if (AppOrPage.getInitialProps) {
          const originalProps = await AppOrPage.getInitialProps(
            appOrPageCtx as any,
          );
          const originalPageProps = isApp
            ? originalProps.pageProps ?? {}
            : originalProps;

          pageProps = {
            ...originalPageProps,
            ...pageProps,
          };
        }
        const getAppTreeProps = (props: Record<string, unknown>) =>
          isApp ? { pageProps: props } : props;

        if (typeof window !== 'undefined' || !opts.ssr) {
          return getAppTreeProps(pageProps);
        }
        const config = getClientConfig(isServer ? { ctx } : {});
        const trpcClient = createTRPCClient(config);
        const queryClient = new QueryClient(config.queryClientConfig);

        const trpcProp: TRPCPrepassProps = {
          config,
          trpcClient,
          queryClient,
          isPrepass: true,
          ssrContext: ctx,
        };
        const prepassProps = {
          pageProps,
          trpc: trpcProp,
        };

        // Run the prepass step on AppTree. This will run all trpc queries on the server.
        // multiple prepass ensures that we can do batching on the server
        while (true) {
          // render fullt tree
          await ssrPrepass(createElement(AppTree, prepassProps as any));
          if (!queryClient.isFetching()) {
            // the render didn't cause the queryClient to fetch anything
            break;
          }

          // wait until the query cache has settled it's promises
          await new Promise<void>((resolve) => {
            const unsub = queryClient.getQueryCache().subscribe((event) => {
              if (event?.query.getObserversCount() === 0) {
                resolve();
                unsub();
              }
            });
          });
        }

        // dehydrate query client's state and add it to the props
        const dehydrated = dehydrate(queryClient, {
          shouldDehydrateQuery() {
            // makes sure errors are also dehydrated
            return true;
          },
        });

        pageProps.trpcState =
          trpcClient.runtime.transformer.serialize(dehydrated);

        const appTreeProps = getAppTreeProps(pageProps);

        const headers =
          opts.responseHeaders?.({
            ctx,
            clientErrors: [...dehydrated.queries, ...dehydrated.queries]
              .map((v) => v.state.error)
              .flatMap((err) =>
                err instanceof Error && err.name === 'TRPCClientError'
                  ? [err as TRPCClientError<TRouter>]
                  : [],
              ),
          }) ?? {};

        for (const [key, value] of Object.entries(headers)) {
          if (!value) {
            continue;
          }

          ctx.res?.setHeader(key, value);
        }
        return appTreeProps;
      };
    }

    const displayName = AppOrPage.displayName || AppOrPage.name || 'Component';
    WithTRPC.displayName = `withTRPC(${displayName})`;

    return WithTRPC as any;
  };
}
