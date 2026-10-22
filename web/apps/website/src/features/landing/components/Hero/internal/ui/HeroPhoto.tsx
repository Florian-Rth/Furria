import { KkSeal } from '@furria/ui/KkSeal';
import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';
import { SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';
import { LANDING_HERO_SIZES } from '@/lib/website-pictures/landing-hero-sizes';

export const HeroPhoto: FC = () => (
  <Box sx={{ position: 'relative' }}>
    <Box
      sx={{
        transform: 'rotate(-1.5deg)',
        border: 2,
        borderColor: 'text.primary',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: kkTokens.shadow.raised,
      }}
    >
      <WebsitePicture slot="landing.hero" sizes={LANDING_HERO_SIZES} priority />
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
