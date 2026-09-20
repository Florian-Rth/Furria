import { useState } from 'react';

export const useSeenBaseline = (
  lastSeenAnnouncementAt: string | null | undefined,
): string | null | undefined => {
  const [baseline, setBaseline] = useState(lastSeenAnnouncementAt);

  if (baseline === undefined && lastSeenAnnouncementAt !== undefined) {
    setBaseline(lastSeenAnnouncementAt);
  }

  return baseline;
};
