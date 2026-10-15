import { useState } from 'react';

export interface LastSeen<TSource, TEntry> {
  source: TSource;
  entry: TEntry;
}

export const useLastSeen = <TSource, TEntry>(
  source: TSource | undefined,
  pick: (source: TSource) => TEntry | null,
): LastSeen<TSource, TEntry> | null => {
  const entry = source === undefined ? null : pick(source);
  const [held, setHeld] = useState<LastSeen<TSource, TEntry> | null>(null);

  if (source !== undefined && entry !== null && (held?.source !== source || held.entry !== entry)) {
    setHeld({ source, entry });
  }

  return source === undefined || entry === null ? held : { source, entry };
};
