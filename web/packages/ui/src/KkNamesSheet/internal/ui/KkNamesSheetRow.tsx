import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { KkIconButton } from '../../../KkIconButton';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';

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
    gap: theme.spacing(1),
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
  const textLine =
    text === undefined ? null : (
      <Typography
        component="span"
        variant="body2"
        sx={{ color: 'text.secondary', overflowWrap: 'anywhere' }}
      >
        {text}
      </Typography>
    );
  const ownMark =
    own && ownLabel !== undefined ? <KkVisuallyHidden>{ownLabel}</KkVisuallyHidden> : null;
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
      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: own ? 800 : 600, overflowWrap: 'anywhere' }}
        >
          {name}
          {noteText}
        </Typography>
        {ownMark}
        {textLine}
      </Stack>
      {removeButton}
    </Stack>
  );
};
