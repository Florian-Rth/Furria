import type { KkConfirmFact } from '@furria/ui/KkConfirmDialog';
import { useKkNotice } from '@furria/ui/KkNotice';
import { useKkSheetCommands } from '@furria/ui/sheet-store';
import type { KkStepState } from '@furria/ui/step-state';
import { useNavigate } from '@tanstack/react-router';
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { GALLERY_INBOX_PATH } from '@/features/gallery/gallery-copy';
import { personNameOf } from '@/features/gallery/gallery-view';
import { toWriteErrorMessage } from '@/lib/write-error';
import { useUploadLinkCreation, useUploadLinkRevocation, useUploadLinksQuery } from '../api';
import type { UploadLink } from '../schemas';
import {
  CREATED_NOTICE,
  dayLabelOf,
  ENDED_LABELS,
  factLineOf,
  LINKS_ERROR,
  momentLabelOf,
  OCCASION_FACT,
  remainingLabelOf,
  SHARE_LABEL,
  SHEET_ID,
  UPLOADED_FACT,
} from '../upload-link-copy';
import { inboxCountOf, linkSectionsOf, remainingOf } from '../upload-link-view';
import type { LinkShare } from './use-link-share';
import { useLinkShare } from './use-link-share';

export interface UploadLinkRowView {
  uploadLinkId: number;
  title: string;
  fact: string;
  day: string;
  relative: string;
  urgent: boolean;
  mark: KkStepState;
  shareable: boolean;
  highlight: boolean;
}

export interface UploadLinkSheetView {
  title: string;
  lines: readonly string[];
  isOpen: boolean;
  waiting: number;
}

export interface UploadLinksPage {
  loaded: boolean;
  failure: string | null;
  retrying: boolean;
  retry: () => void;
  open: UploadLinkRowView[];
  ended: UploadLinkRowView[];
  title: string;
  creating: boolean;
  canCreate: boolean;
  onTitle: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  sheet: UploadLinkSheetView | null;
  share: LinkShare;
  onOpenRow: (uploadLinkId: number) => void;
  onShareRow: (uploadLinkId: number) => void;
  onShareSelected: () => void;
  onCopySelected: () => void;
  onSortSelected: () => void;
  revoking: boolean;
  revokeAsked: boolean;
  revokeFacts: KkConfirmFact[];
  onAskRevoke: () => void;
  onCancelRevoke: () => void;
  onConfirmRevoke: () => void;
}

const markOf = (link: UploadLink): KkStepState => (link.state === 'open' ? 'current' : 'off');

const creatorOf = (link: UploadLink): string | null =>
  link.createdBy === null ? null : personNameOf(link.createdBy);

const relativeOf = (link: UploadLink, now: Date): string =>
  link.state === 'open'
    ? remainingLabelOf(remainingOf(link.expiresAt, now))
    : ENDED_LABELS[link.state];

const isUrgent = (link: UploadLink, now: Date): boolean =>
  link.state === 'open' && remainingOf(link.expiresAt, now).unit === 'hours';

const rowOf = (link: UploadLink, now: Date, highlightId: number | null): UploadLinkRowView => ({
  uploadLinkId: link.uploadLinkId,
  title: link.title,
  fact: factLineOf(link.uploadCount, inboxCountOf(link), creatorOf(link)),
  day: dayLabelOf(link.revokedAt ?? link.expiresAt),
  relative: relativeOf(link, now),
  urgent: isUrgent(link, now),
  mark: markOf(link),
  shareable: link.state === 'open' && link.token !== null,
  highlight: link.uploadLinkId === highlightId,
});

const sheetOf = (link: UploadLink): UploadLinkSheetView => ({
  title: link.title,
  lines: [
    factLineOf(link.uploadCount, inboxCountOf(link), creatorOf(link)),
    link.state === 'open'
      ? `offen bis ${momentLabelOf(link.expiresAt)}`
      : `${ENDED_LABELS[link.state]} ${momentLabelOf(link.revokedAt ?? link.expiresAt)}`,
  ],
  isOpen: link.state === 'open',
  waiting: inboxCountOf(link),
});

const sharedOf = (link: UploadLink | undefined): { title: string; token: string } | null =>
  link === undefined || link.token === null ? null : { title: link.title, token: link.token };

export const useUploadLinksPage = (): UploadLinksPage => {
  const navigate = useNavigate();
  const raiseNotice = useKkNotice();
  const sheets = useKkSheetCommands();
  const share = useLinkShare();
  const query = useUploadLinksQuery();
  const creation = useUploadLinkCreation();
  const revocation = useUploadLinkRevocation();
  const [title, setTitle] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const [revokeAsked, setRevokeAsked] = useState(false);

  const now = new Date();
  const links = query.data?.links ?? [];
  const sections = linkSectionsOf(links);
  const linkOf = (uploadLinkId: number | null): UploadLink | undefined =>
    links.find((link) => link.uploadLinkId === uploadLinkId);
  const selected = linkOf(selectedId);

  const shareLink = (link: UploadLink | undefined): void => {
    const shared = sharedOf(link);
    if (shared !== null) {
      share.share(shared);
    }
  };

  const raiseFailure = (error: Error): void => {
    const message = toWriteErrorMessage(error);
    if (message !== null) {
      raiseNotice({ tone: 'error', message });
    }
  };

  const onCreate = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const occasion = title.trim();
    if (occasion === '' || creation.isPending) {
      return;
    }
    creation.mutate(occasion, {
      onSuccess: (created) => {
        setTitle('');
        setHighlightId(created.uploadLinkId);
        const shared = { title: occasion, token: created.token };
        raiseNotice({
          tone: 'success',
          message: CREATED_NOTICE,
          actions: [{ id: 'share', label: SHARE_LABEL, onSelect: () => share.share(shared) }],
        });
      },
      onError: raiseFailure,
    });
  };

  const onConfirmRevoke = (): void => {
    if (selected === undefined) {
      return;
    }
    revocation.mutate(selected.uploadLinkId, {
      onSuccess: () => {
        setRevokeAsked(false);
        sheets.close();
      },
      onError: raiseFailure,
    });
  };

  return {
    loaded: query.data !== undefined,
    failure: query.data === undefined && query.error !== null ? LINKS_ERROR : null,
    retrying: query.isFetching,
    retry: () => {
      void query.refetch();
    },
    open: sections.open.map((link) => rowOf(link, now, highlightId)),
    ended: sections.ended.map((link) => rowOf(link, now, highlightId)),
    title,
    creating: creation.isPending,
    canCreate: title.trim() !== '',
    onTitle: (event) => setTitle(event.target.value),
    onCreate,
    sheet: selected === undefined ? null : sheetOf(selected),
    share,
    onOpenRow: (uploadLinkId) => {
      setSelectedId(uploadLinkId);
      sheets.open(SHEET_ID);
    },
    onShareRow: (uploadLinkId) => shareLink(linkOf(uploadLinkId)),
    onShareSelected: () => shareLink(selected),
    onCopySelected: () => {
      const shared = sharedOf(selected);
      if (shared !== null) {
        share.copy(shared);
      }
    },
    onSortSelected: () => {
      if (selected !== undefined) {
        sheets.close();
        void navigate({ to: GALLERY_INBOX_PATH, search: { link: selected.uploadLinkId } });
      }
    },
    revoking: revocation.isPending,
    revokeAsked,
    revokeFacts:
      selected === undefined
        ? []
        : [
            { label: OCCASION_FACT, value: selected.title },
            { label: UPLOADED_FACT, value: selected.uploadCount.toLocaleString('de-DE') },
          ],
    onAskRevoke: () => setRevokeAsked(true),
    onCancelRevoke: () => setRevokeAsked(false),
    onConfirmRevoke,
  };
};
