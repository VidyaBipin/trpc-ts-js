<div align="center">
  <h1 align="center">
    <img src="./www/static/img/logo-text.png" alt="tRPC" height="100" />
  </h1>
  <p>End-to-end typesafe APIs made easy</p>
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

## Intro

tRPC allows you to easily build & consume fully typesafe APIs, without schemas or code generation.

- 🧙‍♂️&nbsp; Full static typesafety & autocompletion on the client - on inputs, outputs, & errors.
- 🧙‍♂️&nbsp; Automatic typesafety & autocompletion inferred from your API-paths, their input data, outputs, & errors.
- 🐎&nbsp; Snappy DX. No code generation, run-time bloat, or build pipeline.
- 🍃&nbsp; Light. tRPC has zero deps and a tiny client-side footprint.
- 🐻&nbsp; Easy to add to your existing brownfield project.
- 🔋&nbsp; Batteries included. React-library + Next.js/Express/lambda adapters. _(But tRPC is not tied to React - [reach out](https://twitter.com/alexdotjs) if you want to make a Svelte/Vue/... lib)_
- 🥃&nbsp; Simple to use APIs for queries, mutations, & subscriptions support.
- ⚡️&nbsp; Request batching - requests made at the same time can be automatically combined


... and:

- 👀&nbsp; Quite a few examples in the [./examples](./examples)-folder
- ✅&nbsp; It's well-tested & running in production.


> Still reading? Follow [@alexdotjs on Twitter](https://twitter.com/alexdotjs) if you have any questions or want to keep up to date what's coming next.

### Requirements

- TypeScript > 4.1 because of [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html). Not done the leap to TypeScript yet? You can get benefits with autocompletion etc even if you use raw JS.


### Testimonials

> trpc is most impressive library I&#39;ve seen for Typescript+Next.js in a long time 
> 
> If your app uses API routes between the UI and external APIs this is a super simple, clean way to handle it. No build steps.
> 
> I really hope this gains traction.
> 
> &mdash; Anthony Short (@anthonyshort) <a href="https://twitter.com/anthonyshort/status/1403008330641989637">June 10, 2021</a></blockquote>

[See more](https://trpc/docs/love)

---

- [Intro](#intro)
  - [Requirements](#requirements)
  - [Testimonials](#testimonials)
- [Usage](#usage)
- [Core Team](#core-team)
- [Financial Contributors](#financial-contributors)
  - [Companies](#companies)
  - [Individuals](#individuals)
- [All contributors ✨](#all-contributors-)


## Usage

> **👉  See full documentation documentation on [trpc.io](https://trpc.io/docs). 👈**


**Quick start:**

```bash
npx create-next-app --example https://github.com/trpc/trpc --example-path examples/next-prisma-starter trpc-prisma-starter
```

## Core Team

> 👋 Hi, I'm [Alex / KATT](https://twitter.com/alexdotjs) and I am the maintainer if tRPC, but I want to get more people involved - don't hesitate to contact me if you are interested but don't know where to start.

<table>
  <tr>
    <td align="center"><a href="https://twitter.com/alexdotjs"><img src="https://avatars.githubusercontent.com/u/459267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex / KATT</b></sub></a></td>
  </tr>
</table>


## Financial Contributors

If you like working with tRPC, consider giving a token a apprecation by [GitHub Sponsors](https://github.com/sponsors/KATT) or [get in touch](https://twitter.com/alexdotjs) if you want your company's logo featured in the tRPC repository or website.

### Companies

_No one here yet - get in touch! on [Twitter](https://twitter.com/alexdotjs) or [by email](alex@trpc.io).

### Individuals

<table>
  <tr>
    <td align="center"><a href="https://anthonyshort.me"><img src="https://avatars.githubusercontent.com/u/36125?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anthony Short</b></sub></a></td>
    <td align="center"><a href="https://hampuskraft.com"><img src="https://avatars.githubusercontent.com/u/24176136?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hampus Kraft</b></sub></a></td>
    <td align="center"><a href="http://www.appdome.com"><img src="https://avatars.githubusercontent.com/u/2037064?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Yogel</b></sub></td>
  </tr>
</table>


## All contributors ✨

> tRPC is developed by [KATT](https://twitter.com/alexdotjs), originally based on a proof-of-concept a proof of concept by [colinhacks](https://github.com/colinhacks).

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://twitter.com/alexdotjs"><img src="https://avatars.githubusercontent.com/u/459267?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Alex Johansson</b></sub></a><br /><a href="#ideas-KATT" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/commits?author=KATT" title="Code">💻</a> <a href="https://github.com/trpc/trpc/commits?author=KATT" title="Tests">⚠️</a> <a href="https://github.com/trpc/trpc/commits?author=KATT" title="Documentation">📖</a> <a href="#example-KATT" title="Examples">💡</a> <a href="#maintenance-KATT" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://colinhacks.com/"><img src="https://avatars.githubusercontent.com/u/3084745?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Colin McDonnell</b></sub></a><br /><a href="#ideas-colinhacks" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/commits?author=colinhacks" title="Code">💻</a> <a href="https://github.com/trpc/trpc/commits?author=colinhacks" title="Tests">⚠️</a> <a href="https://github.com/trpc/trpc/commits?author=colinhacks" title="Documentation">📖</a></td>
    <td align="center"><a href="https://pieter.venter.pro"><img src="https://avatars.githubusercontent.com/u/1845861?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pieter Venter</b></sub></a><br /><a href="#ideas-cyrus-za" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/pulls?q=is%3Apr+reviewed-by%3Acyrus-za" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://sendou.cc/"><img src="https://avatars.githubusercontent.com/u/38327916?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kalle</b></sub></a><br /><a href="https://github.com/trpc/trpc/issues?q=author%3ASendouc" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://granderath.tech"><img src="https://avatars.githubusercontent.com/u/22001111?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Malte Granderath</b></sub></a><br /><a href="https://github.com/trpc/trpc/issues?q=author%3Amgranderath" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/kripod"><img src="https://avatars.githubusercontent.com/u/14854048?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kristóf Poduszló</b></sub></a><br /><a href="#ideas-kripod" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/issues?q=author%3Akripod" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://www.richardhaines.dev"><img src="https://avatars.githubusercontent.com/u/22930449?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rich Haines</b></sub></a><br /><a href="#example-molebox" title="Examples">💡</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/simonedelmann"><img src="https://avatars.githubusercontent.com/u/2821076?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Simon Edelmann</b></sub></a><br /><a href="https://github.com/trpc/trpc/commits?author=simonedelmann" title="Code">💻</a> <a href="#ideas-simonedelmann" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/trpc/trpc/commits?author=simonedelmann" title="Tests">⚠️</a> <a href="https://github.com/trpc/trpc/commits?author=simonedelmann" title="Documentation">📖</a> <a href="https://github.com/trpc/trpc/pulls?q=is%3Apr+reviewed-by%3Asimonedelmann" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://anthonyshort.me"><img src="https://avatars.githubusercontent.com/u/36125?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Anthony Short</b></sub></a><br /><a href="#financial-anthonyshort" title="Financial">💵</a></td>
    <td align="center"><a href="https://hampuskraft.com"><img src="https://avatars.githubusercontent.com/u/24176136?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hampus Kraft</b></sub></a><br /><a href="#financial-pnfcre" title="Financial">💵</a></td>
    <td align="center"><a href="https://github.com/hypnodron"><img src="https://avatars.githubusercontent.com/u/3454041?v=4?s=100" width="100px;" alt=""/><br /><sub><b>hypnodron</b></sub></a><br /><a href="https://github.com/trpc/trpc/commits?author=hypnodron" title="Tests">⚠️</a> <a href="https://github.com/trpc/trpc/commits?author=hypnodron" title="Code">💻</a> <a href="https://github.com/trpc/trpc/issues?q=author%3Ahypnodron" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://www.appdome.com"><img src="https://avatars.githubusercontent.com/u/2037064?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Daniel Yogel</b></sub></a><br /><a href="#financial-danielyogel" title="Financial">💵</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->



---

[![Powered by Vercel](./images/powered-by-vercel.svg "Powered by Vercel")](https://vercel.com/?utm_source=trpc&utm_campaign=oss)
