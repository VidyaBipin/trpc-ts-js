'use client';

import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNextAppRouterClient } from '@trpc/next/app-dir/client';
import { AppRouter } from '~/server/routers/_app';
import { getUrl } from './shared';

export const api = createTRPCNextAppRouterClient<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled: (op) =>
            process.env.NODE_ENV === 'development' ||
            (op.direction === 'down' && op.result instanceof Error),
        }),
        httpBatchLink({
          url: getUrl(),
          headers() {
            return {
              'x-trpc-source': 'client',
            };
          },
        }),
      ],
    };
  },
});
