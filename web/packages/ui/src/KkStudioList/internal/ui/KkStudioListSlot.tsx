import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioListSlotProps {
  title: string;
  text: string;
}

export const KkStudioListSlot: FC<KkStudioListSlotProps> = ({ title, text }) => (
  <Stack
    role="listitem"
    data-kk-studio-slot
    sx={(theme) => ({
      flexShrink: 0,
      gap: 0.125,
      mx: 0.5,
      my: 0.5,
      px: 1.25,
      py: 1,
      borderRadius: `${kkTokens.radius.base - 4}px`,
      border: `${kkTokens.line.hair}px dashed ${palette(theme).divider}`,
    })}
  >
    <Typography variant="caption" sx={{ fontWeight: 900, lineHeight: 1.3 }}>
      {title}
    </Typography>
    <Typography variant="caption" sx={{ lineHeight: 1.35, color: 'text.secondary' }}>
      {text}
    </Typography>
  </Stack>
);
