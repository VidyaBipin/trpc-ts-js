import { HashtagIcon } from '@heroicons/react/24/outline';
import { buttonVariants } from '~/components/button';
import { caller } from '~/server/routers/_app';
import { cx } from 'class-variance-authority';
import Link from 'next/link';
import { CreateChannelDialog } from './create-channel';

export default async function Home() {
  const channels = await caller.channel.list();

  return (
    <div className="flex-1 overflow-y-hidden">
      <div className="flex h-full flex-col">
        <header className="p-4">
          <h1 className="text-3xl font-bold text-gray-950 dark:text-gray-50">
            tRPC SSE starter
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-400">
            Showcases Server-sent Events + subscription support
            <br />
            <a
              className="text-gray-700 underline dark:text-gray-400"
              href="https://github.com/trpc/trpc/tree/05-10-subscriptions-sse/examples/next-sse-chat"
              target="_blank"
              rel="noreferrer"
            >
              View Source on GitHub
            </a>
          </p>
        </header>

        <article className="space-y-2 p-4 text-sm text-gray-700 dark:text-gray-400">
          <h2 className="text-lg font-medium text-gray-950 dark:text-gray-50">
            Introduction
          </h2>
          <ul className="list-inside list-disc space-y-2">
            <li>Open inspector and head to Network tab</li>
            <li>All client requests are handled through HTTP</li>
            <li>
              We have a simple backend subscription on new messages that adds
              the newly added message to the current state
            </li>
          </ul>
        </article>

        <div className="mt-6 space-y-2 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-950 dark:text-gray-50">
              Channels
            </h2>
            <CreateChannelDialog />
          </div>
          {channels.map((channel) => (
            <Link
              key={channel.id}
              className={buttonVariants({ variant: 'link' })}
              href={`/channels/${channel.id}`}
            >
              <HashtagIcon className="mr-2 size-4" />
              {channel.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
