import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioCViewEmptyProps {
  text: string;
}

export const KkStudioCViewEmpty: FC<KkStudioCViewEmptyProps> = ({ text }) => (
  <Stack
    data-kk-studio-c-view-empty
    sx={{
      position: 'absolute',
      inset: 0,
      alignItems: 'center',
      justifyContent: 'center',
      rowGap: 0.5,
      color: kkTokens.color.dark.faint,
    }}
  >
    <VideocamOffRoundedIcon />
    <Typography component="span" sx={{ typography: 'caption', fontWeight: 700 }}>
      {text}
    </Typography>
  </Stack>
);
