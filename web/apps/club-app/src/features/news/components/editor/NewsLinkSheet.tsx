import { KkSheet, KkTextField } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  LINK_APPLY,
  LINK_FIELD,
  LINK_INVALID,
  LINK_REMOVE,
  LINK_SHEET_ID,
  LINK_SHEET_TITLE,
  SHEET_CLOSE,
} from '../../editor-copy';
import { useLinkSheet } from '../../hooks/use-link-sheet';
import type { ProseText } from '../../hooks/use-prose-text';

interface NewsLinkSheetProps {
  text: ProseText;
}

export const NewsLinkSheet: FC<NewsLinkSheetProps> = ({ text }) => {
  const link = useLinkSheet(text);
  const helper = link.isInvalid ? LINK_INVALID : undefined;
  const removal = link.hasLink
    ? { label: LINK_REMOVE, onClick: link.remove, tone: 'danger' as const }
    : undefined;

  return (
    <KkSheet id={LINK_SHEET_ID} title={LINK_SHEET_TITLE} closeLabel={SHEET_CLOSE}>
      <KkSheet.Body>
        <Stack sx={{ pt: 1 }}>
          <KkTextField
            name="news-link"
            label={LINK_FIELD}
            type="url"
            inputMode="url"
            autoFocus
            value={link.href}
            error={link.isInvalid}
            helperText={helper}
            onChange={link.onHrefChange}
          />
        </Stack>
      </KkSheet.Body>
      <KkSheet.Actions primary={{ label: LINK_APPLY, onClick: link.apply }} secondary={removal} />
    </KkSheet>
  );
};
