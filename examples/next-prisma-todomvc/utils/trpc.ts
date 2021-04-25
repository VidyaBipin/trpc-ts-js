import { createReactQueryHooks } from '@trpc/react';
import type { inferProcedureOutput } from '@trpc/server';
import superjson from 'superjson';
// ℹ️ Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export
import type { AppRouter } from '../pages/api/trpc/[trpc]';

// create react query hooks for trpc
export const trpc = createReactQueryHooks<AppRouter>();

export function createTRPCClient() {
  const baseUrl = process.browser
    ? ''
    : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3001';

  const url = `${baseUrl}/api/trpc`;

  return trpc.createClient({
    url,
    transformer: superjson,
    getHeaders() {
      if (!process.browser) {
        return {
          'x-ssr': '1',
        };
      }
      return {};
    },
  });
}
/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<
  TRouteKey extends keyof AppRouter['_def']['queries']
> = inferProcedureOutput<AppRouter['_def']['queries'][TRouteKey]>;
