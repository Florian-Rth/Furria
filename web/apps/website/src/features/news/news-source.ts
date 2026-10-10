import type { NewsSection } from '@/lib/public-news/schemas';

export type NewsSource =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; sections: NewsSection[] };

export const resolveNewsSource = (
  sections: NewsSection[] | undefined,
  hasFailed: boolean,
  retry: () => void,
): NewsSource => {
  if (sections !== undefined) {
    return { status: 'ready', sections };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};
