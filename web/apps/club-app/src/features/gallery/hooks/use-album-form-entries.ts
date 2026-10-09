import type { KkSelectOption } from '@furria/ui';
import { useState } from 'react';
import { useCalendarQuery } from '@/features/calendar';
import { entryWindowOf, toEntryOptions } from '../album-form';
import type { AlbumEntry } from '../schemas';

export interface AlbumFormEntries {
  options: KkSelectOption[];
  isLoading: boolean;
  hasFailed: boolean;
}

export const useAlbumFormEntries = (linked: AlbumEntry | null): AlbumFormEntries => {
  const [entryWindow] = useState(() => entryWindowOf(new Date()));
  const calendar = useCalendarQuery({ scope: 'all', groupId: null, ...entryWindow });

  return {
    options: toEntryOptions(calendar.data?.entries ?? [], linked),
    isLoading: calendar.isPending,
    hasFailed: calendar.isError,
  };
};
