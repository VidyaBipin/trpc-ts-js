import { createReactQueryHooks } from '@trpc/react';    
import type { BookRouter } from 'server/routers/book';
const trpc = createReactQueryHooks<BookRouter>();

export const useBookQuery = trpc.useQuery;
export const useBookMutation = trpc.useMutation;