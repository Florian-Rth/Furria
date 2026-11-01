import type { KkSelectOption } from '@furria/ui/KkSelectField';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { useUploadLinksQuery } from '@/features/upload-links/api';
import type { UploadLink } from '@/features/upload-links/schemas';
import { inboxCountOf } from '@/features/upload-links/upload-link-view';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { useInboxesQuery } from '../api';
import { GALLERY_INBOX_PATH } from '../gallery-copy';
import { personNameOf } from '../gallery-view';
import { inboxOptionLabelOf, LINK_INBOX, MY_INBOX, OWNERLESS_INBOX } from '../inbox-copy';
import {
  MINE_INBOX_VALUE,
  ownerOfSearch,
  ownerOfValue,
  searchOfOwner,
  valueOfOwner,
} from '../inbox-owner';
import type { InboxSummary } from '../schemas';
import type { InboxOwner } from '../types';

const INBOX_ROUTE_ID = '/_app/gallery_/inbox';

export interface InboxOwnerChoice {
  owner: InboxOwner;
  ownerName: string | null;
  options: KkSelectOption[];
  value: string;
  onChange: (value: string) => void;
}

const inboxOwnerOf = (inbox: InboxSummary): InboxOwner =>
  inbox.uploader === null
    ? { kind: 'ownerless' }
    : { kind: 'uploader', personId: inbox.uploader.personId };

const linkOwnerOf = (link: UploadLink): InboxOwner => ({
  kind: 'link',
  uploadLinkId: link.uploadLinkId,
});

const inboxNameOf = (inbox: InboxSummary): string =>
  inbox.uploader === null ? OWNERLESS_INBOX : personNameOf(inbox.uploader);

const optionOf = (inbox: InboxSummary): KkSelectOption => ({
  value: valueOfOwner(inboxOwnerOf(inbox)),
  label: inboxOptionLabelOf(inboxNameOf(inbox), inbox.photos + inbox.videos),
});

const linkOptionOf = (link: UploadLink): KkSelectOption => ({
  value: valueOfOwner(linkOwnerOf(link)),
  label: inboxOptionLabelOf(`${LINK_INBOX} ${link.title}`, inboxCountOf(link)),
});

const ownerNameOf = (
  owner: InboxOwner,
  value: string,
  summaries: readonly InboxSummary[],
  links: readonly UploadLink[],
): string | null => {
  switch (owner.kind) {
    case 'mine':
      return null;
    case 'link':
      return links.find((link) => valueOfOwner(linkOwnerOf(link)) === value)?.title ?? null;
    default: {
      const shown = summaries.find((inbox) => valueOfOwner(inboxOwnerOf(inbox)) === value);
      return shown === undefined ? null : inboxNameOf(shown);
    }
  }
};

export const useInboxOwner = (): InboxOwnerChoice => {
  const search = useSearch({ from: INBOX_ROUTE_ID });
  const navigate = useNavigate();
  const { has } = usePermissions();
  const manages = has(PERMISSION_KEYS.galleryManage);
  const inboxes = useInboxesQuery(manages);
  const uploadLinks = useUploadLinksQuery(manages);
  const owner = ownerOfSearch(search);
  const value = valueOfOwner(owner);
  const summaries = inboxes.data?.inboxes ?? [];
  const links = uploadLinks.data?.links ?? [];
  const sortableLinks = links.filter(
    (link) => inboxCountOf(link) > 0 || valueOfOwner(linkOwnerOf(link)) === value,
  );

  const onChange = (next: string): void => {
    void navigate({
      to: GALLERY_INBOX_PATH,
      search: searchOfOwner(ownerOfValue(next)),
      replace: true,
    });
  };

  return {
    owner,
    ownerName: ownerNameOf(owner, value, summaries, links),
    options: manages
      ? [
          { value: MINE_INBOX_VALUE, label: MY_INBOX },
          ...summaries.map(optionOf),
          ...sortableLinks.map(linkOptionOf),
        ]
      : [],
    value,
    onChange,
  };
};
