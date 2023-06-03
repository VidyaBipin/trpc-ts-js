module.exports = {
  docs: [
    {
      type: 'category',
      label: 'tRPC',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'main/introduction',
      },
      items: [
        'main/getting-started',
        'main/concepts',
        'main/quickstart',
        'main/videos-and-community-resources',
        'main/example-apps',
      ],
    },
    {
      type: 'category',
      label: 'Backend Usage',
      collapsed: true,
      link: {
        type: 'generated-index',
        title: 'tRPC server documentation',
        slug: '/server/introduction',
      },
      items: [
        'server/routers',
        'server/procedures',
        'server/validators',
        'server/merging-routers',
        'server/context',
        'server/middlewares',
        {
          type: 'category',
          label: 'Hosting tRPC with Adapters',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'server/adapters-intro',
          },
          items: [
            'server/adapters/standalone',
            'server/adapters/express',
            'server/adapters/fastify',
            'server/adapters/nextjs',
            'server/adapters/aws-lambda',
            'server/adapters/fetch',
          ],
        },
        'server/server-side-calls',
        'server/authorization',
        'server/error-handling',
        'server/error-formatting',
        'server/data-transformers',
        'server/metadata',
        'server/caching',
      ],
    },
    {
      type: 'category',
      label: 'Client Usage',
      collapsed: true,
      items: [
        'client/overview',
        {
          type: 'category',
          label: 'React Query Integration',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'client/react/introduction',
          },
          items: [
            'client/react/setup',
            'client/react/infer-types',
            'client/react/useQuery',
            'client/react/useMutation',
            'client/react/useInfiniteQuery',
            'client/react/useContext',
            'client/react/useQueries',
            'client/react/getQueryKey',
            'client/react/aborting-procedure-calls',
          ],
        },
        {
          type: 'category',
          label: 'Next.js Integration',
          collapsed: true,
          link: {
            type: 'doc',
            id: 'client/nextjs/introduction',
          },
          items: [
            'client/nextjs/setup',
            'client/nextjs/ssr',
            'client/nextjs/ssg',
            'client/nextjs/server-side-helpers',
            'client/nextjs/aborting-procedure-calls',
            'client/nextjs/starter-projects',
          ],
        },
        {
          type: 'category',
          label: 'Vanilla Client',
          collapsed: true,
          items: [
            'client/vanilla/introduction',
            'client/vanilla/setup',
            'client/vanilla/infer-types',
            'client/vanilla/aborting-procedure-calls',
          ],
        },
        {
          type: 'category',
          label: 'Links',
          collapsed: true,
          items: [
            'client/links/overview',
            'client/links/httpLink',
            'client/links/httpBatchLink',
            'client/links/httpBatchStreamLink',
            'client/links/wsLink',
            'client/links/splitLink',
            'client/links/loggerLink',
          ],
        },
        'client/headers',
        'client/cors',
      ],
    },
    {
      type: 'category',
      label: 'Extra information',
      collapsed: true,
      link: {
        type: 'generated-index',
        title: 'Extra Information',
        slug: '/further',
      },
      items: [
        'further/faq',
        'further/rpc',
        'further/subscriptions',
        'further/further-reading',
      ],
    },
    {
      type: 'category',
      label: 'API Reference (Auto-generated)',
      collapsed: true,
      items: [
        {
          type: 'autogenerated',
          dirName: 'typedoc',
        },
      ],
    },
    {
      type: 'doc',
      id: 'migration/migrate-from-v9-to-v10',
    },
    {
      type: 'category',
      label: 'Community',
      collapsed: true,
      items: [
        'community/awesome-trpc',
        'community/contributing',
        'community/love',
        'community/sponsors',
      ],
    },
  ],
};
