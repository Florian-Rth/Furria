import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
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
        overflow: 'hidden',
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
      <Typography
        variant="overline"
        sx={{ fontWeight: 900, letterSpacing: '0.12em', color: 'primary.main', lineHeight: 1.3 }}
      >
        {person.amt}
      </Typography>
      <Typography variant="h5" component="h3" sx={{ lineHeight: 1 }}>
        {person.name}
      </Typography>
    </Stack>
  </Stack>
);
