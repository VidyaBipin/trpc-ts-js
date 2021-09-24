import { useRouter } from 'next/dist/client/router';
import { trpc } from 'utils/trpc';

export default function PostViewPage() {
  const id = useRouter().query.id as string;
  const postQuery = trpc.useQuery(['post.byId', id]);

  if (!postQuery.data) {
    return <>Imagine error/loading state handling here</>;
  }
  return (
    <>
      <h1>{postQuery.data.title}</h1>

      <h2>Raw data:</h2>
      <pre>{JSON.stringify(postQuery.data ?? null, null, 4)}</pre>
    </>
  );
}
