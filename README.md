<div align="center">
  <h1 align="center">
    <img src="./www/static/img/logo.png" alt="tRPC">
  </h1>
  <p>a toolkit for building end-to-end typesafe data layers</p>
  <p>
    <a href="https://codecov.io/gh/trpc/trpc">
      <img src="https://codecov.io/gh/trpc/trpc/branch/main/graph/badge.svg?token=KPPS918B0G" alt="codecov">
    </a>
  </p>
  <p>
    <figure>
      <img src="https://storage.googleapis.com/trpc/trpcgif.gif" alt="Server/client example" />
      <figcaption>
        The client above is <strong>not</strong> importing any code from the server, only it's type declarations.
        <br/>
        <sub><sup><em><a href="https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export">Import type only imports declarations to be used for type annotations and declarations. It always gets fully erased, so there’s no remnant of it at runtime.</a></em></sup></sub>
      </figcaption>
    </figure>
  </p>
</div>

# Intro

tRPC is a framework for building strongly typed RPC APIs with TypeScript. Alternatively, you can think of it as a way to avoid APIs altogether. 

- 🧙‍♂️&nbsp; Automatic type-safety & autocompletion inferred from your API-paths, their input data, & outputs.
- 🐎&nbsp; Snappy DX. No code generation, run-time bloat, or build pipeline.
- 🍃&nbsp; Light. tRPC has zero deps and a tiny client-side footprint.
- 🐻&nbsp; Easy to add to your existing brownfield project.
- 🔋&nbsp; Batteries included. React-library + Next.js/Express adapters. _(But tRPC is not tied to React - [reach out](https://twitter.com/alexdotjs) if you want to make a Svelte/Vue/... lib)_
- 🥃&nbsp; Simple to use APIs for queries & mutations + experimental subscriptions support.
- 👀&nbsp; Quite a few examples in the [./examples](./examples)-folder

> _tRPC requires TypeScript > 4.1 because of [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html), but you can get some benefits with autocompletion etc even if you use raw JS._

---

- [Intro](#intro)
- [Usage](#usage)
  - [Example apps](#example-apps)
  - [Defining procedures (_endpoints / routes_)](#defining-procedures-endpoints--routes)
  - [Merging routers](#merging-routers)
  - [Router middlewares](#router-middlewares)
  - [Data transformers](#data-transformers)
  - [Authorization](#authorization)
  - [React-specific helpers (`@trpc/react`)](#react-specific-helpers-trpcreact)
    - [`useInfiniteQuery()`](#useinfinitequery)
    - [`invalidateQuery()`](#invalidatequery)
    - [`ssr()`: Server-side rendering (SSR / SSG)](#ssr-server-side-rendering-ssr--ssg)
      - [Using `ssr.prefetchOnServer()` (recommended)](#using-ssrprefetchonserver-recommended)
      - [Invoking directly](#invoking-directly)
- [Further reading](#further-reading)
  - [Who is this for?](#who-is-this-for)
  - [HTTP Methods <-> Type mapping](#http-methods---type-mapping)
  - [Relationship to GraphQL](#relationship-to-graphql)
  - [Alternative projects](#alternative-projects)
- [Development](#development)
  - [Development workflow](#development-workflow)
  - [Testing](#testing)
- [Contributors ✨](#contributors-)


# Usage


## Example apps

You can play clone this project and play with local examples

```bash
git clone git@github.com:trpc/trpc.git
cd trpc
yarn

yarn example:hello
```

Here's all the example apps:

| Command                   | Live URL                                           | Example path                                                   | Description                                                                                            |
| ------------------------- | -------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `yarn example:chat`       | [chat.trpc.io](https://chat.trpc.io)               | [`./examples/next-ssg-chat`](./examples/next-ssg-chat)         | Next.js real-time chat example with SSG & Prisma. [Playwright](https://playwright.dev) for E2E-testing |
| `yarn example:hello`      | [hello-world.trpc.io](https://hello-world.trpc.io) | [`./examples/next-hello-world`](./examples/next-hello-world)   | Minimal Next.js example. [Playwright](https://playwright.dev) for E2E-testing                          |
| `yarn example:standalone` | _n/a_                                              | [`./examples/standalone-server`](./examples/standalone-server) | Standalone tRPC server + node client                                                                   |
| `yarn example:playground` | _n/a_                                              | [`./examples/playground`](./examples/playground)               | Express server + node client                                                                           |

## Defining procedures (_endpoints / routes_)

> - A procedure can be viewed as the equivalent of a REST-endpoint.
> - There's no internal difference between queries and mutations apart from semantics.

Defining procedures is the same for queries, mutations, and subscription with the exception that subscriptions need to return a `Subscription`-instance.



<details><summary>Example query without input argument</summary>

```tsx
import * as trpc from '@trpc/server';

export const appRouter = trpc.router()
  // Create procedure at path 'hello'
  .query('hello', {
    resolve({ ctx }) {
      return {
        greeting: `hello world`,
      };
    },
  });

export type AppRouter = typeof appRouter;
```

</details>
<details><summary>Example query with input argument</summary>

```tsx
import * as trpc from '@trpc/server';
import * as z from 'zod';

export const appRouter = trpc.router()
  .query('hello', {
    input: z
      .object({
        text: z.string().optional(),
      })
      .optional(),
    resolve({ input }) {
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
      };
    },
  });

export type AppRouter = typeof appRouter;
```

</details>
<details><summary>To add multiple endpoints, you must chain the calls</summary>

```tsx
import * as trpc from '@trpc/server';

export const appRouter = trpc.router()
  .query('hello', {
    resolve({ ctx }) {
      return {
        text: `hello world`,
      };
    },
  })
  .query('bye', {
    resolve({ ctx }) {
      return {
        text: `goodbye`,
      };
    },
  });

export type AppRouter = typeof appRouter;
```

</details>


## Merging routers

Writing all API-code in your code in the same file is a bad idea. It's easy to merge procedures with other procedures. Thanks to TypeScript 4.1 template literal types we can also prefix the procedures without breaking type safety.

<details><summary>Example code</summary>

```ts
const posts = createRouter()
  .mutation('create', {
    input: z.object({
      title: z.string(),
    }),
    resolve: ({ input }) => {
      // ..
      return {
        id: 'xxxx',
        ...input,
      }
    },
  })
  .query('list', {
    resolve() {
      // ..
      return []
    }
  });

const users = createRouter()
  .query('list', {
    resolve() {
      // ..
      return []
    }
  });


const appRouter = createRouter()
  .merge('users.', users) // prefix user procedures with "users."
  .merge('posts.', posts) // prefix poosts procedures with "posts."
  ;
```

</details>

## Router middlewares

You can are able to add middlewares to a whole router with the `middleware()` method. The middleware(s) will be run before any of the procedures defined after are invoked & can be async or sync.

Example, from [the tests](./packages/server/test/middleware.test.ts):
<details><summary>Code</summary>

```ts
trpc
  .router<Context>()
  .query('foo', {
    resolve() {
      return 'bar';
    },
  })
  .merge(
    'admin.',
    trpc
      .router<Context>()
      .middleware(async ({ ctx }) => {
        if (!ctx.user?.isAdmin) {
          throw httpError.unauthorized();
        }
      })
      .query('secretPlace', {
        resolve() {
          resolverMock();

          return 'a key';
        },
      }),
  )
```
</details>

In the example above any call to `admin.*` will ensure that the user is an "admin" before executing any query or mutation.



## Data transformers

You are able to serialize the response data & input args (in order to be able to transparently use e.g. standard `Date`s). The transformers need to be added both to the server and the client.

- `createNextApiHandler()` in [`./examples/next-ssg-chat/[trpc.ts]`](./examples/next-ssg-chat/pages/api/trpc/%5Btrpc%5D.ts), and
- `createTRPCClient` in [`./examples/next-ssg-chat/pages/_app.tsx`](./examples/next-ssg-chat/pages/_app.tsx)

## Authorization

The `createContext`-function is called for each incoming request so here you can add contextual information about the calling user from the request object.

<details><summary>Create context from request headers</summary>

```ts
import * as trpc from '@trpc/server';
import { inferAsyncReturnType } from '@trpc/server';
import { decodeAndVerifyJwtToken } from './somewhere/in/your/app/utils';

export async function createContext({
  req,
  res,
}: trpcNext.CreateNextContextOptions) {
  // Create your context based on the request object
  // Will be available as `ctx` in all your resolvers

  // This is just an example of something you'd might want to do in your ctx fn
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const user = await decodeAndVerifyJwtToken(req.headers.authorization.split(' ')[1])
      return user;
    }
    return null;
  }
  const user = await getUserFromHeader();

  return {
    user,
  };
}
type Context = inferAsyncReturnType<typeof createContext>;

// [..] Define API handler and app router
```
</details>
<details><summary>Authorize using resolver</summary>

```ts
import * as trpc from '@trpc/server';
import { createRouter } from './[trpc]';

export const appRouter = createRouter()
  // open for anyone
  .query('hello', {
    input: z.string().optional(),
    resolve: ({ input, ctx }) => {
      return `hello ${input ?? ctx.user?.name ?? 'world'}`;
    },
  })
  // checked in resolver
  .query('secret', {
    resolve: ({ ctx }) => {
      if (!ctx.user) {
        throw trpc.httpError.unauthorized();
      }
      if (ctx.user?.name !== 'KATT') {
        throw trpc.httpError.forbidden();
      }
      return {
        secret: 'sauce',
      };
    },
  });
```
</details>
<details><summary>Authorize using middleware</summary>

```ts
import * as trpc from '@trpc/server';
import { createRouter } from './[trpc]';

export const appRouter = createRouter()
  // this is accessible for everyone
  .query('hello', {
    input: z.string().optional(),
    resolve: ({ input, ctx }) => {
      return `hello ${input ?? ctx.user?.name ?? 'world'}`;
    },
  })
  .merge(
    'admin.',
    createRouter()
      // this protectes all procedures defined after in this router
      .middleware(async ({ ctx }) => {
        if (!ctx.user?.isAdmin) {
          throw httpError.unauthorized();
        }
      })
      .query('secret', {
        resolve: ({ ctx }) => {
          return {
            secret: 'sauce',
          }
        },
    }),
  );
```
</details>

## React-specific helpers (`@trpc/react`)

> _Docs relevant to `@trpc/react`. Follow [Next.js-guide](#nextjs) before doing the below._

### `useInfiniteQuery()`

> - Your procedure needs to accept a `cursor` input of `any` type
> - For more details read the [react-query docs](https://react-query.tanstack.com/reference/useInfiniteQuery)
> - Example here is using Prisma - see their docs on [cursor-based pagination](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

<details><summary>Example procedure (dummy code)</summary>

```tsx
import * as trpc from '@trpc/server';
import { Context } from './[trpc]';

trpc.router<Context>()
  .query('infinitePosts', {
    input: z.object({
      limit: z.number().min(1).max(100).optional(),
      cursor: z.number().optional(), // <-- "cursor" needs to exist, but can be any type
    }),
    async resolve({ input: { limit = 50, cursor } }) {
      const items = await prisma.post.findMany({
        take: limit + 1, // get an extra item at the end which we'll use as next cursor
        where: {
          title: {
            contains: 'Prisma' /* Optional filter */,
          },
        },
        cursor: cursor ? { myCursor: cursor } : undefined,
        orderBy: {
          myCursor: 'asc',
        },
      })
      let nextCursor: typeof cursor | null = null;
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem!.myCursor;
      }

      return {
        items,
        nextCursor,
      };
    })
```
</details>
<details><summary>Example component</summary>

```tsx
import { trpc } from '../utils/trpc';

function MyComponent() {
  const myQuery = trpc.useInfiniteQuery(
    [
      'infinitePosts',
      {
        limit: 10,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  // [...]
}

```
</details>

### `invalidateQuery()`

A type safe wrapper around calling `queryClient.invalidateQueries()`, all it does is to call `queryClient.invalidateQueries()` with the passed args. [See react-query docs](https://react-query.tanstack.com/guides/query-invalidation) if you want more fine-grained control.

<details>

```tsx
import { trpc } from '../utils/trpc'

const mutation = trpc.useMutation('editPost', {
  onSuccess(input) {
    queryClient.invalidateQuery(['allPosts']);
    queryClient.invalidateQuery(['postById', input.id]);
  },
})
```
</details>

### `ssr()`: Server-side rendering (SSR / SSG)

> - See the [chat example](./examples/next-ssg-chat) for a working example.
> - Follow [Next.js-guide](#nextjs) before doing the below

#### Using `ssr.prefetchOnServer()` (recommended)



<details><summary>In `getStaticProps`</summary>

```tsx
import { trpc } from '../utils/trpc'
 // Important - only ever import & use your `appRouter` in the SSR-methods
import { appRouter } from './api/trpc/[trpc]';

export async function getStaticProps() {
  // Create SSR helpers with your app's router and context object
  const ssr = trpc.ssr(appRouter, {});

  await ssr.prefetchInfiniteQuery('messages.list', { limit: 100 });
  // or `await ssr.prefetchQuery('messages.list', { limit: 100 });`

  return {
    props: {
      dehydratedState: trpc.dehydrate(),
    },
  };
}
```
</details>

This will cache the `messages.list` so it's instant when `useQuery(['message.list', { limit: 100 }])` gets called.


#### Invoking directly

You can also invoke a procedure directly and get the data in a promise.

<details><summary>In `getStaticProps`</summary>

```tsx
// Important - only ever import & use your `appRouter` in the SSR-methods
import { appRouter } from './api/trpc/[trpc]'; 
import { trpc } from '../utils/trpc'

export async function getStaticProps() {
  // Create SSR helpers with your app's router and context object
  const ssr = trpc.ssr(appRouter, {});

  const allPosts = await ssr.caller.query('allPosts', { limit: 100 })

  return {
    props: {
      allPosts,
    },
  };
}
```
</details>

# Further reading

## Who is this for?

- tRPC is for full-stack javascripters. It makes it dead easy to write "endpoints" which you safely use in your app.
- It's designed for monorepos as you need to export/import the type definitions from/to your server
- If you're already in a team where you're mixing languages or have third party consumers that you have no control of, you're better off with making a [GraphQL](https://graphql.org/)-API which is language-agnostic.

## HTTP Methods <-> Type mapping

| HTTP Method | Mapping           | Notes                                                                                        |
| ----------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `GET`       | `.query()`        | Input JSON-stringified in query param.<br/>_e.g._ `?input=${JSON.stringify(input)`           |
| `POST`      | `.mutation()`     | Input in post body.                                                                          |
| `PATCH`     | `.subscription()` | Input in post body.<br/>:warning: Experimental. API might change without major version bump. |

## Relationship to GraphQL

If you are already have a custom GraphQL-server for your project; don't use tRPC. GraphQL is amazing; it's great to be able to make a flexible API where each consumer can pick just the data needed for it. 

The thing is, GraphQL isn't that easy to get right - ACL is needed to be solved on a per-type basis, complexity analysis, and performance are all non-trivial things.

We've taken a lot of inspiration from GraphQL & if you've made GraphQL-servers before you'll be familiar with the concept of input types and resolvers.

tRPC is a lot simpler and couples your server & app (for good and for bad). It makes it easy to move quickly, do changes without updating a schema & there's no of thinking about the ever-traversable graph.

## Alternative projects

- [Blitz.js](https://blitzjs.com) is a full-stack framework. tRPC is just the data layer, but the philosophy of their _"Zero-API data layer"_ is very close to tRPC, but tRPC doesn't require a build pipeline nor is it tied to Next.js or even React.
- ...

....


# Development

```bash
yarn install
```

This will install all dependencies in each project, build them, and symlink them via Lerna

## Development workflow

```bash
git clone git@github.com:trpc/trpc.git
cd trpc
yarn
```

In one terminal, run tsdx watch in parallel:

```bash
yarn dev
```

This builds each package to `<packages>/<package>/dist` and runs the project in watch mode so any edits you save inside `<packages>/<package>/src` cause a rebuild to `<packages>/<package>/dist`. The results will stream to to the terminal.

## Testing

> [![codecov](https://codecov.io/gh/trpc/trpc/branch/main/graph/badge.svg?token=KPPS918B0G)](https://codecov.io/gh/trpc/trpc) 
> 
> Some things regarding subscriptions is excluded in the coverage as it's an experimental feature

Testing is currently coalesced in [./packages/server/test](./packages/server/test) - we import the different libs from here, this makes it easier for us to do integration testing + getting test coverage on the whole codebase.

# Contributors ✨

Original [`0.x`](https://github.com/trpc/trpc/tree/v0.x)-version was created by [colinhacks](https://github.com/colinhacks) and `>1.x` was created by [KATT](https://twitter.com/alexdotjs).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://twitter.com/alexdotjs"><img src="https://avatars.githubusercontent.com/u/459267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex Johansson</b></sub></a><br /><a href="#ideas-KATT" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/commits?author=KATT" title="Code">💻</a> <a href="https://github.com/trpc/trpc/commits?author=KATT" title="Tests">⚠️</a> <a href="https://github.com/trpc/trpc/commits?author=KATT" title="Documentation">📖</a> <a href="#example-KATT" title="Examples">💡</a> <a href="#maintenance-KATT" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://colinhacks.com/"><img src="https://avatars.githubusercontent.com/u/3084745?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Colin McDonnell</b></sub></a><br /><a href="#ideas-colinhacks" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/commits?author=colinhacks" title="Code">💻</a> <a href="https://github.com/trpc/trpc/commits?author=colinhacks" title="Tests">⚠️</a> <a href="https://github.com/trpc/trpc/commits?author=colinhacks" title="Documentation">📖</a></td>
    <td align="center"><a href="https://pieter.venter.pro"><img src="https://avatars.githubusercontent.com/u/1845861?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pieter Venter</b></sub></a><br /><a href="#ideas-cyrus-za" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/pulls?q=is%3Apr+reviewed-by%3Acyrus-za" title="Reviewed Pull Requests">👀</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->



---

[![Powered by Vercel](./images/powered-by-vercel.svg "Powered by Vercel")](https://vercel.com/?utm_source=trpc&utm_campaign=oss)
