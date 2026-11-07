import type { ActPageSearch } from '@/features/acts/schemas';
import type { ActMusicSearch } from './schemas';

export const editorTargetOf = (search: ActMusicSearch): ActPageSearch => {
  const { tool, ...page } = search;

  return { ...page, view: 'play', edit: true };
};

export const editorSearchOf = (search: ActMusicSearch): Record<string, string> =>
  Object.fromEntries(
    Object.entries(editorTargetOf(search)).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, String(value)]],
    ),
  );
