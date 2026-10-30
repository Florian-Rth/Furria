import MusicOffRoundedIcon from '@mui/icons-material/MusicOffRounded';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkTwinEmptyProps {
  title: string;
  text: string;
}

export const KkTwinEmpty: FC<KkTwinEmptyProps> = ({ title, text }) => (
  <Stack
    data-kk-twin-empty
    sx={{
      alignItems: 'center',
      textAlign: 'center',
      gap: 1.5,
      maxWidth: kkTokens.measure.empty,
      px: 2,
    }}
  >
    <Box
      aria-hidden
      sx={(theme) => ({
        display: 'grid',
        placeItems: 'center',
        width: '4rem',
        height: '4rem',
        borderRadius: '50%',
        color: (theme.vars ?? theme).palette.text.secondary,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}`,
      })}
    >
      <MusicOffRoundedIcon />
    </Box>
    <Typography component="h2" variant="h3">
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
      {text}
    </Typography>
  </Stack>
);
