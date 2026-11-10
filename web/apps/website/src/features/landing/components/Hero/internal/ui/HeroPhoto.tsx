import { KkJesterCap } from '@furria/ui/KkJesterCap';
import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';
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
        top: theme.spacing(-5),
        right: theme.spacing(-4),
      })}
    >
      <KkJesterCap size={136} rotation={-8} />
    </Box>
  </Box>
);
