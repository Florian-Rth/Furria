import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { storyPhotoCaption } from '@/features/club/story-content';

export const ClubStoryPhoto: FC = () => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      overflow: 'hidden',
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    <KkPhotoPlaceholder label={storyPhotoCaption} aspectRatio={kkTokens.aspectRatio.landscape} />
  </Box>
);
