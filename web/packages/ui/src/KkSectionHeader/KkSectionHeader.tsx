import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { KkEyebrow } from '../KkEyebrow';
import { kkTokens } from '../tokens';
import { KkSectionMarker } from './internal/ui/KkSectionMarker';

interface KkSectionHeaderProps {
  title: string;
  kicker?: string;
  numeral?: string;
  action?: ReactNode;
}

export const KkSectionHeader: FC<KkSectionHeaderProps> = ({ title, kicker, numeral, action }) => (
  <Stack
    direction="row"
    data-kk-section-header
    sx={{ alignItems: 'flex-end', gap: { xs: 2, md: 3 }, flexWrap: { xs: 'wrap', md: 'nowrap' } }}
  >
    <KkSectionMarker numeral={numeral} />
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      {kicker !== undefined && <KkEyebrow tone="muted">{kicker}</KkEyebrow>}
      <Typography variant="h2" component="h2" sx={{ lineHeight: 1 }}>
        {title}
      </Typography>
    </Stack>
    <Box
      aria-hidden
      sx={{
        flexGrow: 1,
        borderBottom: kkTokens.line.section,
        borderColor: 'text.primary',
        mb: { xs: 1, md: 2 },
        display: { xs: 'none', md: 'block' },
      }}
    />
    {action !== undefined && <Box sx={{ flexShrink: 0, mb: { md: 1 } }}>{action}</Box>}
  </Stack>
);
