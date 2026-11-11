import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import type { KkSx } from '../../../kk-sx';

interface KkSignUpSheetOwnLineProps {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  sx?: KkSx;
}

export const KkSignUpSheetOwnLine: FC<KkSignUpSheetOwnLineProps> = ({
  text,
  actionLabel,
  onAction,
  sx,
}) => {
  const action =
    actionLabel === undefined || onAction === undefined ? null : (
      <KkButton variant="text" size="small" onClick={onAction}>
        {actionLabel}
      </KkButton>
    );

  return (
    <Stack
      direction="row"
      data-kk-sign-up-sheet-own-line
      sx={[{ alignItems: 'center', gap: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography
        component="p"
        variant="body1"
        sx={{ flexGrow: 1, m: 0, fontWeight: 700, minWidth: 0, overflowWrap: 'anywhere' }}
      >
        {text}
      </Typography>
      {action}
    </Stack>
  );
};
