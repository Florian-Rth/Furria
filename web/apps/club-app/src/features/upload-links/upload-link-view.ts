import type { UploadLink, UploadLinkState } from './schemas';

export const UPLOAD_PAGE_PATH = '/photos';
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MS_PER_HOUR = 3_600_000;
const HOURS_PER_DAY = 24;

export type LinkPageStage =
  | 'missing'
  | 'checking'
  | 'open'
  | 'expired'
  | 'revoked'
  | 'unknown'
  | 'failed';

export interface LinkLookupStatus {
  state: UploadLinkState | null;
  failedStatus: number | null;
  failed: boolean;
}

export type Remaining = { unit: 'days' | 'hours'; count: number } | { unit: 'over' };

export interface LinkSections {
  open: UploadLink[];
  ended: UploadLink[];
}

export const shareOriginOf = (apiBaseUrl: string, pageOrigin: string): string =>
  apiBaseUrl === '' ? pageOrigin : new URL(apiBaseUrl).origin;

export const shareUrlOf = (origin: string, token: string): string =>
  `${origin}${UPLOAD_PAGE_PATH}#${token}`;

export const tokenOfHash = (hash: string): string | null => {
  const token = hash.startsWith('#') ? hash.slice(1) : hash;
  return TOKEN_PATTERN.test(token) ? token : null;
};

const NOT_FOUND_STATUSES: readonly number[] = [400, 404];

export const linkPageStageOf = (token: string | null, lookup: LinkLookupStatus): LinkPageStage => {
  if (token === null) {
    return 'missing';
  }
  if (lookup.state !== null) {
    return lookup.state;
  }
  if (lookup.failedStatus !== null && NOT_FOUND_STATUSES.includes(lookup.failedStatus)) {
    return 'unknown';
  }
  return lookup.failed ? 'failed' : 'checking';
};

export const remainingOf = (expiresAt: string, now: Date): Remaining => {
  const hours = (new Date(expiresAt).getTime() - now.getTime()) / MS_PER_HOUR;
  if (hours <= 0) {
    return { unit: 'over' };
  }
  return hours < HOURS_PER_DAY
    ? { unit: 'hours', count: Math.ceil(hours) }
    : { unit: 'days', count: Math.ceil(hours / HOURS_PER_DAY) };
};

const byExpiry = (left: UploadLink, right: UploadLink): number =>
  left.expiresAt.localeCompare(right.expiresAt) || left.uploadLinkId - right.uploadLinkId;

const byNewest = (left: UploadLink, right: UploadLink): number =>
  right.createdAt.localeCompare(left.createdAt) || right.uploadLinkId - left.uploadLinkId;

export const linkSectionsOf = (links: readonly UploadLink[]): LinkSections => ({
  open: links.filter((link) => link.state === 'open').sort(byExpiry),
  ended: links.filter((link) => link.state !== 'open').sort(byNewest),
});

export const inboxCountOf = (link: UploadLink): number => link.inboxPhotos + link.inboxVideos;
