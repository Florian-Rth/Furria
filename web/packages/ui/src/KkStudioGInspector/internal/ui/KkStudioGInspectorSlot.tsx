import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioGInspectorSlotProps {
  text: string;
}

export const KkStudioGInspectorSlot: FC<KkStudioGInspectorSlotProps> = ({ text }) => (
  <Box
    data-kk-studio-g-slot
    sx={(theme) => ({
      px: 1,
      py: 0.375,
      borderRadius: `${kkTokens.radius.bar * 2}px`,
      border: `${kkTokens.line.hair}px dashed ${(theme.vars ?? theme).palette.divider}`,
    })}
  >
    <Typography
      variant="caption"
      sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.3 }}
    >
      {text}
    </Typography>
  </Box>
);
