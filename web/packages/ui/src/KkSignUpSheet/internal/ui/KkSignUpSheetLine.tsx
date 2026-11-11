import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { rowDividerTop } from '../../../internal/row-divider';
import { KkIconButton } from '../../../KkIconButton';
import type { KkSx } from '../../../kk-sx';

const SINGLE_LINE = {
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;
const NAME_MAX_SHARE = '45%';

interface KkSignUpSheetLineProps {
  name: string;
  text?: string;
  removeLabel?: string;
  removeDisabled?: boolean;
  onRemove?: () => void;
  sx?: KkSx;
}

const linePaint = (theme: Theme): CSSObject => ({
  ...rowDividerTop,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  minWidth: 0,
  minHeight: theme.spacing(5),
  paddingBlock: theme.spacing(0.5),
});

export const KkSignUpSheetLine: FC<KkSignUpSheetLineProps> = ({
  name,
  text,
  removeLabel,
  removeDisabled = false,
  onRemove,
  sx,
}) => {
  const lead = text ?? name;
  const byline =
    text === undefined ? null : (
      <Typography
        component="span"
        variant="body2"
        sx={{ ...SINGLE_LINE, flexShrink: 0, maxWidth: NAME_MAX_SHARE, color: 'text.secondary' }}
      >
        {name}
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
    <Stack
      component="li"
      data-kk-sign-up-sheet-line
      sx={[linePaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography
        component="span"
        variant="body2"
        sx={{ ...SINGLE_LINE, flexGrow: 1, fontWeight: 700 }}
      >
        {lead}
      </Typography>
      {byline}
      {removeButton}
    </Stack>
  );
};
