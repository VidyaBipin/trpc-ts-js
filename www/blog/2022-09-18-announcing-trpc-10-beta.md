---
slug: announcing-trpc-10-beta
title: Announcing tRPC 10.0 Beta
author: Alex / KATT 🐱
author_title: Creator of tRPC
author_url: https://twitter.com/alexdotjs
author_image_url: https://avatars1.githubusercontent.com/u/459267?s=460&v=4
---

tRPC has already changed how many people think about APIs and about the boundaries between frontend and backend. Since we released our last major about a year ago, we've gotten 11,000+ more stars on GitHub, thousands more applications using tRPC, and countless members of our community giving us feedback & from this, we've learned a lot.

The developer experience in version 10 of tRPC is unparalleled; the boundaries between backend and frontend are truly blurred, we've worked very hard at addressing the TypeScript performance issues many of you have faced and we are we have created something we are convinced you will love to work with.

## Massively improved performance

TypeScript enables us to do very cool things, but it comes at a cost. Many of the things that we (ab)use in tRPC, are very heavy on the compiler, and as a result, you might have experienced your IDE slowing down as your application grows. In v10, we've improved this massively.

We've done this through changing our API that allows TypeScript to be a lot faster, especially during incremental compilation, allowing your IDE to remain snappy.

## Improved DX

There was still a drift.

## And so much more

When working with tRPC v9, you might have experienced that your IDE started getting sluggish when getting big  when working with tRPC

- Massively improved performance
- How to define a v10 router & procedure
- The `t` object
- Calling a procedure
- Multiple input parsers
- Magical API / Unparalleled DX
  - CMD+clicking and refactoring from the frontend
  - React-library rewritten
  - Sub-routers
- Rewritten links
- Decoupled from Node.js
- Client decoupled from HTTP-primitives
- *Still* zero code generation
- Reusable middlewares
- Reusable base procedures
- Easier to infer types
- Subscriptions rewritten
- Upgrade to react-query 4
- Incremental migration path - (maybe codemod soon)



Random phrases:

- Goodbye chainable routers, hello chainable procedures.



> To read the complete migration guide and how to (incrementally!) update, see the [Migration Guide](https://trpc.io/docs/v10/migrate-from-v9-to-v10).
>
