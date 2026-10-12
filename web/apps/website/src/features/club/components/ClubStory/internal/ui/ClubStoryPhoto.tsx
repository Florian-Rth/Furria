import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';

const CLUB_STORY_SIZES = '(min-width: 1536px) 720px, (min-width: 900px) 50vw, 100vw';

export const ClubStoryPhoto: FC = () => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    <WebsitePicture slot="club.story" sizes={CLUB_STORY_SIZES} />
  </Box>
);
