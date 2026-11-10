import { KkLead } from '@furria/ui/KkLead';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { storyBody, storyLead } from '@/features/club/story-content';

export const ClubStoryBody: FC = () => (
  <Stack sx={{ gap: 2 }}>
    <KkLead>{storyLead}</KkLead>
    <KkLead>{storyBody}</KkLead>
  </Stack>
);
