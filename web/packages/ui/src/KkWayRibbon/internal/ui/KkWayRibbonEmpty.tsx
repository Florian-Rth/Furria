import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { RIBBON_HEIGHT } from '../logic/ribbon-sizes';

interface KkWayRibbonEmptyProps {
  text: string;
}

export const KkWayRibbonEmpty: FC<KkWayRibbonEmptyProps> = ({ text }) => (
  <Stack
    sx={(theme) => ({
      flex: 1,
      height: RIBBON_HEIGHT,
      justifyContent: 'center',
      px: 1.5,
      borderRadius: `${kkTokens.radius.bar * 2}px`,
      border: `${kkTokens.line.hair}px dashed ${(theme.vars ?? theme).palette.divider}`,
    })}
  >
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
      {text}
    </Typography>
  </Stack>
);
