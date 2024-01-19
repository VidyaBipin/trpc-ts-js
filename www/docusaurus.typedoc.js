// @ts-check

/**
 * @param {Record<string, string[]>} directories
 */
function generateTypedocDocusaurusPlugins(directories) {
  return Object.entries(directories).map(([directory, entrypoints], idx) => [
    'docusaurus-plugin-typedoc',
    {
      // TypeDoc options
      // https://typedoc.org/guides/options/
      skipErrorChecking: true,
      id: directory,
      entryPoints: ['index.ts', ...entrypoints].map(
        (it) => `../packages/${directory}/src/${it}`,
      ),
      tsconfig: `../packages/${directory}/tsconfig.build.json`,
      out: `./typedoc/${directory}`,
      readme: 'none',
      sourceLinkTemplate:
        'https://github.com/trpc/trpc/blob/{gitRevision}/{path}#L{line}',
      excludeInternal: true,
      excludePrivate: true,
      excludeProtected: true,

      // docusaurus-plugin-typedoc options
      // https://github.com/tgreyuk/typedoc-plugin-markdown/tree/master/packages/docusaurus-plugin-typedoc#plugin-options
      sidebar: {
        categoryLabel: `@trpc/${directory}`,
        position: idx,
      },

      // Markdown options
      // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#markdown-front-matter
      frontmatterGlobals: {
        pagination_prev: null,
        pagination_next: null,
        custom_edit_url: null,
      },
    },
  ]);
}

module.exports = { generateTypedocDocusaurusPlugins };
