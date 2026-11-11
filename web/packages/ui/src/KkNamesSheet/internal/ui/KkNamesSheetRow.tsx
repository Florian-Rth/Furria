import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { KkIconButton } from '../../../KkIconButton';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';

const SINGLE_LINE = {
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;
const BYLINE_MAX_SHARE = '45%';

interface KkNamesSheetRowProps {
  name: string;
  note?: string;
  text?: string;
  own?: boolean;
  ownLabel?: string;
  removeLabel?: string;
  removeDisabled?: boolean;
  onRemove?: () => void;
}

export const KkNamesSheetRow: FC<KkNamesSheetRowProps> = ({
  name,
  note,
  text,
  own = false,
  ownLabel,
  removeLabel,
  removeDisabled = false,
  onRemove,
}) => {
  const rowPaint = (theme: Theme): CSSObject => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    minWidth: 0,
    minHeight: theme.spacing(5),
    padding: theme.spacing(0.5, 1),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    backgroundColor: own ? inkWash(theme, '7%') : 'transparent',
  });
  const noteText =
    note === undefined ? null : (
      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, ml: 0.75 }}>
        {note}
      </Box>
    );
  const ownMark =
    own && ownLabel !== undefined ? <KkVisuallyHidden>{ownLabel}</KkVisuallyHidden> : null;
  const lead =
    text === undefined ? (
      <Typography
        component="span"
        variant="body2"
        sx={{ flexGrow: 1, fontWeight: own ? 800 : 600, overflowWrap: 'anywhere' }}
      >
        {name}
        {noteText}
        {ownMark}
      </Typography>
    ) : (
      <Typography
        component="span"
        variant="body2"
        sx={{ ...SINGLE_LINE, flexGrow: 1, fontWeight: 700 }}
      >
        {text}
      </Typography>
    );
  const byline =
    text === undefined ? null : (
      <Typography
        component="span"
        variant="body2"
        sx={{ ...SINGLE_LINE, flexShrink: 0, maxWidth: BYLINE_MAX_SHARE, color: 'text.secondary' }}
      >
        {name}
        {noteText}
        {ownMark}
      </Typography>
    );
  const removeButton =
    removeLabel === undefined || onRemove === undefined ? null : (
      <KkIconButton
        label={removeLabel}
        icon="delete"
        size="small"
        disabled={removeDisabled}
        onClick={onRemove}
      />
    );

  return (
    <Stack component="li" data-kk-names-sheet-row data-kk-names-sheet-own={own} sx={rowPaint}>
      {lead}
      {byline}
      {removeButton}
    </Stack>
  );
};
