import type { InboxSearch } from './gallery-copy';
import type { InboxOwner } from './types';

export const MINE_INBOX_VALUE = 'mine';
export const OWNERLESS_INBOX_VALUE = 'ownerless';
const LINK_PREFIX = 'link:';

export interface InboxOwnerSearch {
  uploader?: number;
  ownerless?: boolean;
  link?: number;
}

export const valueOfOwner = (owner: InboxOwner): string => {
  switch (owner.kind) {
    case 'mine':
      return MINE_INBOX_VALUE;
    case 'ownerless':
      return OWNERLESS_INBOX_VALUE;
    case 'uploader':
      return String(owner.personId);
    case 'link':
      return `${LINK_PREFIX}${owner.uploadLinkId}`;
  }
};

export const ownerOfValue = (value: string): InboxOwner => {
  if (value === MINE_INBOX_VALUE) {
    return { kind: 'mine' };
  }
  if (value === OWNERLESS_INBOX_VALUE) {
    return { kind: 'ownerless' };
  }
  return value.startsWith(LINK_PREFIX)
    ? { kind: 'link', uploadLinkId: Number(value.slice(LINK_PREFIX.length)) }
    : { kind: 'uploader', personId: Number(value) };
};

export const searchOfOwner = (owner: InboxOwner): InboxOwnerSearch => {
  switch (owner.kind) {
    case 'mine':
      return {};
    case 'ownerless':
      return { ownerless: true };
    case 'uploader':
      return { uploader: owner.personId };
    case 'link':
      return { link: owner.uploadLinkId };
  }
};

export const ownerOfSearch = (search: InboxSearch): InboxOwner => {
  if (search.link !== undefined) {
    return { kind: 'link', uploadLinkId: search.link };
  }
  if (search.ownerless === true) {
    return { kind: 'ownerless' };
  }
  return search.uploader === undefined
    ? { kind: 'mine' }
    : { kind: 'uploader', personId: search.uploader };
};
