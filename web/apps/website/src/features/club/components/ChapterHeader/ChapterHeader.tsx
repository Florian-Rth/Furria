import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface ChapterHeaderProps {
  numeral: string;
  kicker: string;
  title: string;
}

export const ChapterHeader: FC<ChapterHeaderProps> = ({ numeral, kicker, title }) => (
  <Stack
    direction="row"
    data-kk-chapter-header
    sx={{ alignItems: 'flex-end', gap: { xs: 2, md: 3 } }}
  >
    <Box
      aria-hidden
      sx={{
        fontFamily: kkTokens.font.display,
        color: 'primary.main',
        fontSize: { xs: '3.5rem', md: '7rem' },
        lineHeight: 0.74,
        flexShrink: 0,
      }}
    >
      {numeral}
    </Box>
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <Typography
        variant="overline"
        sx={{ fontWeight: 800, letterSpacing: '0.16em', color: 'text.secondary', lineHeight: 1.4 }}
      >
        {kicker}
      </Typography>
      <Typography variant="h2" component="h2" sx={{ lineHeight: 1 }}>
        {title}
      </Typography>
    </Stack>
    <Box sx={{ flexGrow: 1, borderBottom: 2, borderColor: 'text.primary', mb: { xs: 1, md: 2 } }} />
  </Stack>
);
