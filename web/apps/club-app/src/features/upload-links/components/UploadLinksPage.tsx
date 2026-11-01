import { KkButton } from '@furria/ui/KkButton';
import { KkErrorState } from '@furria/ui/KkErrorState';
import { KkNote } from '@furria/ui/KkNote';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import { KkTitleHeader } from '@furria/ui/KkTitleHeader';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AREA_HANDOVERS, GALLERY_ORIGIN } from '@/features/session/app-sections';
import { useUploadLinksPage } from '../hooks/use-upload-links-page';
import {
  EMPTY_LINKS,
  ENDED_SECTION,
  FAILED_LINE,
  LINKS_LEAD,
  LINKS_TITLE,
  OPEN_SECTION,
  RETRY_LABEL,
} from '../upload-link-copy';
import { UploadLinkCreateForm } from './UploadLinkCreateForm';
import { UploadLinkQueue } from './UploadLinkQueue';
import { UploadLinkRevokeDialog } from './UploadLinkRevokeDialog';
import { UploadLinkSheet } from './UploadLinkSheet';

export const UploadLinksPage: FC = () => {
  const page = useUploadLinksPage();
  const retry = (
    <KkButton loading={page.retrying} onClick={page.retry}>
      {RETRY_LABEL}
    </KkButton>
  );
  const failure =
    page.failure === null ? null : (
      <KkErrorState title={page.failure} description={FAILED_LINE} action={retry} />
    );
  const loading = page.loaded || page.failure !== null ? null : <KkSkeletonRow count={3} />;
  const isEmpty = page.loaded && page.open.length === 0 && page.ended.length === 0;
  const empty = isEmpty ? <KkNote>{EMPTY_LINKS}</KkNote> : null;
  const open =
    page.open.length === 0 ? null : (
      <UploadLinkQueue
        label={OPEN_SECTION}
        rows={page.open}
        onOpen={page.onOpenRow}
        onShare={page.onShareRow}
      />
    );
  const ended =
    page.ended.length === 0 ? null : (
      <UploadLinkQueue
        label={ENDED_SECTION}
        rows={page.ended}
        onOpen={page.onOpenRow}
        onShare={page.onShareRow}
      />
    );

  return (
    <KkScreen
      kind="detail"
      title={LINKS_TITLE}
      origin={GALLERY_ORIGIN}
      header={<KkTitleHeader title={LINKS_TITLE} lead={LINKS_LEAD} />}
      handover={AREA_HANDOVERS.gallery}
    >
      <Stack sx={{ rowGap: 3, minWidth: 0 }}>
        <UploadLinkCreateForm
          title={page.title}
          creating={page.creating}
          canCreate={page.canCreate}
          onTitle={page.onTitle}
          onCreate={page.onCreate}
        />
        {failure}
        {loading}
        {empty}
        {open}
        {ended}
      </Stack>
      <UploadLinkSheet page={page} />
      <UploadLinkRevokeDialog page={page} />
    </KkScreen>
  );
};
