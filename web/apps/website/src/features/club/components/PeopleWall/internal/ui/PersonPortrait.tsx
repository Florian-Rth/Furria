import { KkEyebrow, KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { type Person, personPhotoCaption } from '@/features/club/people-content';

interface PersonPortraitProps {
  person: Person;
  tint: string;
}

export const PersonPortrait: FC<PersonPortraitProps> = ({ person, tint }) => (
  <Stack data-kk-person sx={{ gap: 1.5, alignItems: 'flex-start' }}>
    <Box
      sx={{
        width: '100%',
        border: 1,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        boxShadow: kkTokens.shadow.raised,
      }}
    >
      <KkPhotoPlaceholder
        label={personPhotoCaption}
        tint={tint}
        aspectRatio={kkTokens.aspectRatio.portrait}
      />
    </Box>
    <Stack sx={{ gap: 0.25, alignItems: 'flex-start' }}>
      <KkEyebrow>{person.amt}</KkEyebrow>
      <Typography variant="h5" component="h3" sx={{ lineHeight: 1 }}>
        {person.name}
      </Typography>
    </Stack>
  </Stack>
);
