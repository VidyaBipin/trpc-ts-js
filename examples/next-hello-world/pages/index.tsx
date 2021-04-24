import { TRPCClient } from '@trpc/react';
import Head from 'next/head';
import { trpc } from '../utils/trpc';

export default function Home() {
  // try typing here to see that you get autocompletion & type safety on the procedure's name
  const helloNoArgs = trpc.useQuery(['hello']);
  const helloWithArgs = trpc.useQuery(['hello', { text: 'client' }]);

  // try to uncomment next line to show type checking:
  // const helloWithInvalidArgs = trpc.useQuery(['hello', { text: false }]);

  console.log(helloNoArgs.data); // <-- hover over this object to see it's type inferred

  const utils = trpc.useContext();
  const postsQuery = trpc.useQuery(['posts.list']);
  const addPost = trpc.useMutation('posts.add', {
    onSuccess() {
      utils.invalidateQuery(['posts.list']);
    },
  });
  const fieldErrors = addPost.error?.shape?.zodError?.fieldErrors ?? {};
  return (
    <>
      <Head>
        <title>Hello tRPC</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>tRPC starter examples</h1>

      <h1>Posts query (statically rendered)</h1>

      <h2>Posts</h2>
      {postsQuery.data?.map((post) => (
        <pre key={post.id}>{JSON.stringify(post, null, 2)}</pre>
      ))}

      <h2>Add post</h2>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const $text: HTMLInputElement = (e as any).target.elements.text;
          const $title: HTMLInputElement = (e as any).target.elements.title;
          const input = {
            title: $title.value,
            text: $text.value,
          };
          try {
            await addPost.mutateAsync(input);
            $title.value = '';
            $text.value = '';
          } catch {}
        }}
      >
        <label htmlFor="title">Title:</label>
        <br />
        <input
          id="title"
          name="title"
          type="text"
          disabled={addPost.isLoading}
        />
        {fieldErrors.title && <div className="error">{fieldErrors.title}</div>}

        <br />
        <label htmlFor="text">Text:</label>
        <br />
        <textarea id="text" name="text" disabled={addPost.isLoading} />
        {fieldErrors.text && <div className="error">{fieldErrors.text}</div>}
        <br />
        <input type="submit" disabled={addPost.isLoading} />
        {addPost.error && <p className="error">{addPost.error.message}</p>}
      </form>
      <hr />
      <h2>Hello World queries</h2>
      <ul>
        <li>
          helloNoArgs ({helloNoArgs.status}):{' '}
          <pre>{JSON.stringify(helloNoArgs.data, null, 2)}</pre>
        </li>
        <li>
          helloWithArgs ({helloWithArgs.status}):{' '}
          <pre>{JSON.stringify(helloWithArgs.data, null, 2)}</pre>
        </li>
      </ul>

      <div style={{ marginTop: '100px' }}>
        <a
          href="https://vercel.com/?utm_source=trpc&utm_campaign=oss"
          target="_blank"
          rel="noreferrer"
        >
          <img
            src="/powered-by-vercel.svg"
            alt="Powered by Vercel"
            height={25}
          />
        </a>
      </div>
      <style jsx>{`
        .error {
          color: red;
        }
      `}</style>
    </>
  );
}

// export async function getStaticProps() {
//   const ssr = trpc.ssr({
//     client: new TRPCClient({
//       url: 'http://localhost:3000/api/trpc',
//       getHeaders() {
//         return {};
//       },
//     }),
//   });

//   await ssr.prefetchQuery('posts.list');

//   return {
//     props: {
//       dehydratedState: ssr.dehydrate(),
//     },
//     revalidate: 1,
//   };
// }
