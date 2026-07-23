import { KkPhotoPlaceholder, KkSeal, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { clubHeroPhotoCaption } from '@/features/club/hero-content';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';

export const ClubHeroPhoto: FC = () => (
  <Box sx={{ position: 'relative' }}>
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        overflow: 'hidden',
        boxShadow: kkTokens.shadow.raised,
      }}
    >
      <KkPhotoPlaceholder
        label={clubHeroPhotoCaption}
        aspectRatio={kkTokens.aspectRatio.landscape}
      />
    </Box>
    <Box
      sx={(theme) => ({
        position: 'absolute',
        top: theme.spacing(-3),
        right: theme.spacing(-2.25),
      })}
    >
      <KkSeal
        dateLabel={`${SESSION_OPENING_DAY}.${SESSION_OPENING_MONTH}`}
        caption="ERÖFFNUNG"
        size={112}
        rotation={-6}
      />
    </Box>
  </Box>
);
