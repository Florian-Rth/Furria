import type { KkSelectOption } from '@furria/ui';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { usePermissions } from '@/features/session';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useInboxesQuery } from '../api';
import { GALLERY_INBOX_PATH } from '../gallery-copy';
import { personNameOf } from '../gallery-view';
import { inboxOptionLabelOf, MY_INBOX, OWNERLESS_INBOX } from '../inbox-copy';
import type { InboxSummary } from '../schemas';
import type { InboxOwner } from '../types';

const INBOX_ROUTE_ID = '/_app/gallery_/inbox';
const MINE = 'mine';
const OWNERLESS = 'ownerless';

export interface InboxOwnerChoice {
  owner: InboxOwner;
  ownerName: string | null;
  options: KkSelectOption[];
  value: string;
  onChange: (value: string) => void;
}

const valueOfOwner = (owner: InboxOwner): string => {
  switch (owner.kind) {
    case 'mine':
      return MINE;
    case 'ownerless':
      return OWNERLESS;
    case 'uploader':
      return String(owner.personId);
  }
};

const inboxValueOf = (inbox: InboxSummary): string =>
  inbox.uploader === null ? OWNERLESS : String(inbox.uploader.personId);

const inboxNameOf = (inbox: InboxSummary): string =>
  inbox.uploader === null ? OWNERLESS_INBOX : personNameOf(inbox.uploader);

const optionOf = (inbox: InboxSummary): KkSelectOption => ({
  value: inboxValueOf(inbox),
  label: inboxOptionLabelOf(inboxNameOf(inbox), inbox.photos + inbox.videos),
});

export const useInboxOwner = (): InboxOwnerChoice => {
  const search = useSearch({ from: INBOX_ROUTE_ID });
  const navigate = useNavigate();
  const { has } = usePermissions();
  const manages = has(PERMISSION_KEYS.galleryManage);
  const inboxes = useInboxesQuery(manages);
  const owner: InboxOwner = search.ownerless
    ? { kind: 'ownerless' }
    : search.uploader === undefined
      ? { kind: 'mine' }
      : { kind: 'uploader', personId: search.uploader };
  const value = valueOfOwner(owner);
  const summaries = inboxes.data?.inboxes ?? [];
  const shownInbox = summaries.find((inbox) => inboxValueOf(inbox) === value);
  const ownerName =
    owner.kind === 'mine' || shownInbox === undefined ? null : inboxNameOf(shownInbox);

  const onChange = (next: string): void => {
    void navigate({
      to: GALLERY_INBOX_PATH,
      search:
        next === MINE ? {} : next === OWNERLESS ? { ownerless: true } : { uploader: Number(next) },
      replace: true,
    });
  };

  return {
    owner,
    ownerName,
    options: manages ? [{ value: MINE, label: MY_INBOX }, ...summaries.map(optionOf)] : [],
    value,
    onChange,
  };
};
