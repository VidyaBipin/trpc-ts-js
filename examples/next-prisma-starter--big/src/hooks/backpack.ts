import { createReactQueryHooks } from '@trpc/react';    
import type { BackpackRouter } from 'server/routers/backpack';
const trpc = createReactQueryHooks<BackpackRouter>();

export const useBackpackQuery = trpc.useQuery;
export const useBackpackInfiniteQuery = trpc.useInfiniteQuery;
export const useBackpackMutation = trpc.useMutation;
export const useBackpackContext = trpc.useContext;