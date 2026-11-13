import { KkSheet } from '@furria/ui/KkSheet';
import { KkTextField } from '@furria/ui/KkTextField';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useLinkSheet } from '../hooks/use-link-sheet';
import type { RichTextField } from '../hooks/use-rich-text';
import {
  LINK_APPLY,
  LINK_FIELD,
  LINK_INVALID,
  LINK_REMOVE,
  LINK_SHEET_CLOSE,
  LINK_SHEET_TITLE,
} from '../rich-text-copy';

interface RichTextLinkSheetProps {
  text: RichTextField;
  sheetId: string;
}

export const RichTextLinkSheet: FC<RichTextLinkSheetProps> = ({ text, sheetId }) => {
  const link = useLinkSheet(text, sheetId);
  const helper = link.isInvalid ? LINK_INVALID : undefined;
  const removal = link.hasLink
    ? { label: LINK_REMOVE, onClick: link.remove, tone: 'danger' as const }
    : undefined;

  return (
    <KkSheet id={sheetId} title={LINK_SHEET_TITLE} closeLabel={LINK_SHEET_CLOSE}>
      <KkSheet.Body>
        <Stack sx={{ pt: 1 }}>
          <KkTextField
            name={sheetId}
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
