module.exports = {
  docs: [
    {
      type: 'category',
      label: 'tRPC',
      collapsed: false,
      items: [
        'main/introduction',
        'react/nextjs',
        'main/example-apps',
        'main/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Usage',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Server',
          collapsed: false,
          items: [
            'server/procedures',
            'server/merging-routers',
            'server/middlewares',
            'server/data-transformers',
            'server/context',
          ]
        },
        {
          type: 'category',
          label: '@trpc/react',
          collapsed: false,
          items: [
            'react/nextjs',
            'react/useInfiniteQuery',
            'react/invalidateQuery',
            'react/ssr',
          ],
        },
      ],
    },
    'further/further-reading'
  ],
};
