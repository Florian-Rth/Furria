import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioIDetailSlotProps {
  label: string;
  text: string;
}

export const KkStudioIDetailSlot: FC<KkStudioIDetailSlotProps> = ({ label, text }) => (
  <Stack
    data-kk-studio-i-slot
    sx={(theme) => ({
      gap: 0.25,
      px: 1.25,
      py: 0.875,
      borderRadius: `${kkTokens.radius.base * 0.75}px`,
      border: `${kkTokens.line.hair}px dashed ${(theme.vars ?? theme).palette.divider}`,
    })}
  >
    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {text}
    </Typography>
  </Stack>
);
