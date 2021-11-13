import { createReactQueryHooks } from '@trpc/react';    
import type { CatRouter } from 'server/routers/cat';
const trpc = createReactQueryHooks<CatRouter>();

export const useCatQuery = trpc.useQuery;
export const useCatInfiniteQuery = trpc.useInfiniteQuery;
export const useCatMutation = trpc.useMutation;
export const useCatContext = trpc.useContext;