import { HashtagIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CreateChannelDialog } from '~/app/create-channel';
import { Button } from '~/components/button';
import { cn } from '~/lib/utils';
import { auth, signOut } from '~/server/auth';
import { caller } from '~/server/routers/_app';
import Link from 'next/link';
import { Chat } from './chat';

export default async function Home(
  props: Readonly<{ params: { channelId: string } }>,
) {
  const channelId = props.params.channelId;
  const session = await auth();
  const channels = await caller.channel.list();

  return (
    <div className="flex flex-1 overflow-hidden">
      <nav className="hidden w-64 flex-col border-r bg-white p-4 dark:border-gray-800 dark:bg-gray-900 sm:flex">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <HashtagIcon className="size-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium">Channels</span>
          </div>
          <CreateChannelDialog>
            <Button size="icon" className="size-8">
              <PlusIcon className="size-4" />
            </Button>
          </CreateChannelDialog>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50',
                channel.id === channelId &&
                  'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50',
              )}
              href={`/channels/${channel.id}`}
            >
              <HashtagIcon className="h-4 w-4" />
              {channel.name}
            </Link>
          ))}
          <div className="mt-auto">
            {session?.user && (
              <div className="flex items-center justify-between">
                <span className="text-base font-medium">
                  Hello, {session?.user?.name} 👋
                </span>
                <form
                  action={async () => {
                    'use server';
                    await signOut();
                  }}
                >
                  <Button type="submit" size="sm">
                    Sign Out
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Chat session={session} channelId={channelId} />
    </div>
  );
}
