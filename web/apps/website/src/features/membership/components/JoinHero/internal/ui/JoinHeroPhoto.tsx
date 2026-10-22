import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';

const JOIN_HERO_SIZES = '(min-width: 1536px) 600px, 42vw';

export const JoinHeroPhoto: FC = () => (
  <Box
    aria-hidden
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
    <WebsitePicture slot="join.hero" sizes={JOIN_HERO_SIZES} />
  </Box>
);
