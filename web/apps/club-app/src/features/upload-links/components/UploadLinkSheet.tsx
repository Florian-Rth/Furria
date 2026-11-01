import { KkMeta } from '@furria/ui/KkMeta';
import { KkSheet } from '@furria/ui/KkSheet';
import type { KkSheetAction } from '@furria/ui/sheet-actions';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { UploadLinksPage } from '../hooks/use-upload-links-page';
import {
  COPY_LABEL,
  REVOKE_LABEL,
  SHARE_LABEL,
  SHEET_CLOSE,
  SHEET_ID,
  sortLabelOf,
} from '../upload-link-copy';

interface UploadLinkSheetProps {
  page: UploadLinksPage;
}

export const UploadLinkSheet: FC<UploadLinkSheetProps> = ({ page }) => {
  const { sheet } = page;
  const title = sheet?.title ?? '';
  const lines = (sheet?.lines ?? []).map((line) => <KkMeta key={line}>{line}</KkMeta>);
  const isOpen = sheet?.isOpen ?? false;
  const sort: KkSheetAction = {
    label: sortLabelOf(sheet?.waiting ?? 0),
    onClick: page.onSortSelected,
  };
  const share: KkSheetAction = {
    label: page.share.canShare ? SHARE_LABEL : COPY_LABEL,
    onClick: page.share.canShare ? page.onShareSelected : page.onCopySelected,
  };
  const revoke: KkSheetAction = { label: REVOKE_LABEL, tone: 'danger', onClick: page.onAskRevoke };
  const secondary = isOpen ? share : undefined;
  const tertiary = isOpen ? revoke : undefined;

  return (
    <KkSheet id={SHEET_ID} title={title} closeLabel={SHEET_CLOSE}>
      <KkSheet.Body>
        <Stack sx={{ rowGap: 0.5 }}>{lines}</Stack>
      </KkSheet.Body>
      <KkSheet.Actions primary={sort} secondary={secondary} tertiary={tertiary} />
    </KkSheet>
  );
};
