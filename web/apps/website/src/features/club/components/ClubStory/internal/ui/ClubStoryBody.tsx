import { KkLead, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { storyBodyPlaceholder, storyBodyPlaceholderNote } from '@/features/club/story-content';

export const ClubStoryBody: FC = () => (
  <Stack sx={{ gap: 2, alignItems: 'flex-start' }}>
    <KkLead>{storyBodyPlaceholder}</KkLead>
    <Stack
      direction="row"
      data-kk-story-placeholder
      sx={{
        alignItems: 'center',
        gap: 1,
        border: 1,
        borderColor: 'warning.main',
        borderRadius: `${kkTokens.radius.base}px`,
        px: 1.5,
        py: 1,
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontWeight: 800, letterSpacing: '0.12em', color: 'warning.main' }}
      >
        PLATZHALTER
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {storyBodyPlaceholderNote}
      </Typography>
    </Stack>
  </Stack>
);
