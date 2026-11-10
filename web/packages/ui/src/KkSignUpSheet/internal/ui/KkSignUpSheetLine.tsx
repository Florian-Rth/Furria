import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { KkIconButton } from '../../../KkIconButton';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkSignUpSheetLineProps {
  name: string;
  text?: string;
  own?: boolean;
  ownLabel?: string;
  removeLabel?: string;
  removeDisabled?: boolean;
  onRemove?: () => void;
  sx?: KkSx;
}

export const KkSignUpSheetLine: FC<KkSignUpSheetLineProps> = ({
  name,
  text,
  own = false,
  ownLabel,
  removeLabel,
  removeDisabled = false,
  onRemove,
  sx,
}) => {
  const linePaint = (theme: Theme): CSSObject => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(1),
    minWidth: 0,
    padding: theme.spacing(0.5, 1),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    backgroundColor: own ? inkWash(theme, '7%') : 'transparent',
  });
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
    <Stack
      component="li"
      data-kk-sign-up-sheet-line
      data-kk-sign-up-sheet-own={own}
      sx={[linePaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: own ? 800 : 600, overflowWrap: 'anywhere' }}
        >
          {name}
        </Typography>
        {ownMark}
        {textLine}
      </Stack>
      {removeButton}
    </Stack>
  );
};
