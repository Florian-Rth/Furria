import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { BOARD_INK } from '../../../internal/status-paint';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

interface KkFlapBoardNoticeProps {
  text: string;
}

export const KkFlapBoardNotice: FC<KkFlapBoardNoticeProps> = ({ text }) => (
  <Stack
    direction="row"
    role="alert"
    data-kk-flap-board-notice
    sx={{ alignItems: 'center', columnGap: 1, minWidth: 0, color: BOARD_INK.attention }}
  >
    <KkIcon name="offline" size="small" />
    <Typography
      component="span"
      sx={{
        typography: 'caption',
        fontWeight: 800,
        letterSpacing: kkTokens.type.tracking.label,
        textTransform: 'uppercase',
      }}
    >
      {text}
    </Typography>
  </Stack>
);
