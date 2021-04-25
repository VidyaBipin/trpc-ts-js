import { withTRPCClient } from '@trpc/next';
import { AppType } from 'next/dist/next-server/lib/utils';
import React from 'react';
import type { AppRouter } from './api/trpc/[trpc]';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

MyApp.getInitialProps = async ({ ctx }) => {
  // make it sloow
  // await new Promise((resolve) => setTimeout(resolve, 1000));

  const ONE_DAY_SECONDS = 60 * 60 * 24;
  ctx.res?.setHeader(
    'Cache-Control',
    `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`,
  );
  return {
    pageProps: {},
  };
};

export default withTRPCClient<AppRouter>(
  ({ ctx }) => {
    if (process.browser) {
      return {
        url: '/api/trpc',
      };
    }
    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : 'http://localhost:3000/api/trpc';

    return {
      url,
      getHeaders() {
        return {
          'x-ssr': '1',
        };
      },
    };
  },
  { ssr: true },
)(MyApp);
