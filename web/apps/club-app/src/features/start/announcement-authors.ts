import type { StartAnnouncement, StartPerson } from './schemas';

export interface AuthorGroup {
  key: string;
  author: StartPerson | null;
  announcements: StartAnnouncement[];
}

const UNSIGNED_KEY = 'unsigned';

const authorKeyOf = (author: StartPerson | null): string =>
  author === null ? UNSIGNED_KEY : String(author.personId);

export const isUnread = (
  announcement: StartAnnouncement,
  lastSeenAnnouncementAt: string | null | undefined,
): boolean => {
  if (lastSeenAnnouncementAt === undefined) {
    return false;
  }
  if (lastSeenAnnouncementAt === null) {
    return true;
  }

  return Date.parse(announcement.publishedAt) > Date.parse(lastSeenAnnouncementAt);
};

export const authorGroupsOf = (announcements: readonly StartAnnouncement[]): AuthorGroup[] => {
  const groups = new Map<string, AuthorGroup>();

  for (const announcement of announcements) {
    const key = authorKeyOf(announcement.author);
    const known = groups.get(key);

    if (known === undefined) {
      groups.set(key, { key, author: announcement.author, announcements: [announcement] });
    } else {
      known.announcements.push(announcement);
    }
  }

  return [...groups.values()];
};
