import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';

const CLUB_HERO_SIZES = '(min-width: 1536px) 600px, 42vw';

export const ClubHeroPhoto: FC = () => (
  <Box
    sx={{
      display: { xs: 'none', desktop: 'block' },
      position: 'relative',
      zIndex: 1,
      border: kkTokens.line.hair,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    <WebsitePicture slot="club.hero" sizes={CLUB_HERO_SIZES} />
  </Box>
);
