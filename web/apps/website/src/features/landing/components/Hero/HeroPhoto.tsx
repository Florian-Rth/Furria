import { KkPhotoPlaceholder, KkSeal, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { FOUNDING_YEAR, SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';

export const HeroPhoto: FC = () => (
  <Box sx={{ position: 'relative' }}>
    <Box
      sx={{
        transform: 'rotate(-1.5deg)',
        border: 2,
        borderColor: 'text.primary',
        borderRadius: `${kkTokens.radius.base}px`,
        overflow: 'hidden',
        boxShadow: kkTokens.shadow.raised,
      }}
    >
      <KkPhotoPlaceholder label="garde-auf-der-buehne" />
    </Box>
    <Stack
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRadius: `${kkTokens.radius.pill}px`,
        boxShadow: kkTokens.shadow.rest,
        px: 1.75,
        py: 1,
        transform: 'rotate(2deg)',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.04em' }}>
        Seit {FOUNDING_YEAR}
      </Typography>
    </Stack>
    <Box sx={{ position: 'absolute', top: -24, right: -18 }}>
      <KkSeal
        dateLabel={`${SESSION_OPENING_DAY}.${SESSION_OPENING_MONTH}`}
        caption="ERÖFFNUNG"
        size={112}
        rotation={-6}
      />
    </Box>
  </Box>
);
