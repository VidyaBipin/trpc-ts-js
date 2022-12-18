import { z } from 'zod';

const isJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};
const jsonStr = z
  .string()
  .refine(isJSON, 'Needs to be JSON')
  .transform((str) => JSON.parse(str));

export function zodParams<TType>(schema: z.ZodType<TType>) {
  const querySchema = z.object({
    input: jsonStr.pipe(schema),
  });
  return {
    decodeRequest: (req: Request) => {
      const url = new URL(req.url);
      const obj = Object.fromEntries(url.searchParams.entries());

      return querySchema.safeParse(obj);
    },
    toSearchString: (obj: typeof schema['_input']) => {
      schema.parse(obj);
      return `input=${encodeURIComponent(JSON.stringify(obj))}`;
    },
  };
}

function truncateWordsFn(str: string, maxCharacters: number) {
  if (str.length <= maxCharacters) {
    return str;
  }
  // break at closest word
  const truncated = str.slice(0, maxCharacters);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.slice(0, lastSpace) + ' …';
}
function truncatedWordSchema(opts: { maxCharacters: number }) {
  return z
    .string()
    .transform((str) => truncateWordsFn(str, opts.maxCharacters));
}

export const fontParams = zodParams(
  z.object({
    family: z.string(),
    weight: z.number().default(400),
    text: z.string().optional(),
  }),
);

export const blogParams = zodParams(
  z.object({
    title: truncatedWordSchema({ maxCharacters: 70 }),
    description: truncatedWordSchema({ maxCharacters: 145 }),
    date: z
      .string()
      .transform((val) => new Date(val))
      .transform((date) =>
        Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(date),
      ),
    readingTimeInMinutes: z.number().positive(),
    authorName: z.string(),
    authorTitle: z.string(),
    authorImg: z.string(),
  }),
);

export const docsParams = zodParams(
  z.object({
    title: z.string(),
    description: truncatedWordSchema({ maxCharacters: 215 }),
    permalink: z
      .string()
      .startsWith('/')
      .transform((v) => `trpc.io${v}`),
  }),
);
