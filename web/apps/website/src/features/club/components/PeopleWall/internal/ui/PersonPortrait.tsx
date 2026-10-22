import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkPhoto } from '@furria/ui/KkPhoto';
import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { BoardTile } from '@/features/club/people-content';

interface PersonPortraitProps {
  tile: BoardTile;
}

export const PersonPortrait: FC<PersonPortraitProps> = ({ tile }) => (
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
      <KkPhoto
        alt={tile.name}
        orientation="portrait"
        placeholderLabel={tile.initials}
        image={tile.portrait}
        tint={tile.tint}
      />
    </Box>
    <Stack sx={{ gap: 0.25, alignItems: 'flex-start' }}>
      <KkEyebrow>{tile.officeName}</KkEyebrow>
      <Typography variant="h3" component="h3" sx={{ lineHeight: 1 }}>
        {tile.name}
      </Typography>
    </Stack>
  </Stack>
);
