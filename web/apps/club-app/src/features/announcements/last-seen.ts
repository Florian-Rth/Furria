interface Published {
  publishedAt: string;
}

export const toNewestPublishedAt = (announcements: readonly Published[]): string | null => {
  let newest: string | null = null;

  for (const { publishedAt } of announcements) {
    if (newest === null || Date.parse(publishedAt) > Date.parse(newest)) {
      newest = publishedAt;
    }
  }

  return newest;
};

export const toNextLastSeenAt = (
  current: string | null,
  seenUpTo: string | null,
  now: Date,
): string => {
  const capped =
    seenUpTo === null || Date.parse(seenUpTo) > now.getTime() ? now.toISOString() : seenUpTo;

  if (current !== null && Date.parse(current) >= Date.parse(capped)) {
    return current;
  }

  return capped;
};
