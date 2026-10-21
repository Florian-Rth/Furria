import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkAvatar } from './KkAvatar/KkAvatar';

const ARROW = '→';

interface KkSuccessionPerson {
  initials: string;
  name: string;
}

interface KkSuccessionProps {
  outgoing: KkSuccessionPerson | null;
  incoming: KkSuccessionPerson;
  incomingNote?: string;
}

export const KkSuccession: FC<KkSuccessionProps> = ({ outgoing, incoming, incomingNote }) => {
  const from =
    outgoing === null ? null : (
      <>
        <KkAvatar initials={outgoing.initials} size="small" component="span" />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          {outgoing.name}
        </Box>
        <Box component="span" aria-hidden sx={{ color: 'text.secondary' }}>
          {ARROW}
        </Box>
      </>
    );
  const note =
    incomingNote === undefined ? null : (
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {incomingNote}
      </Box>
    );

  return (
    <Stack
      direction="row"
      component="span"
      data-kk-succession
      sx={{
        alignItems: 'center',
        flexWrap: 'wrap',
        columnGap: 0.625,
        rowGap: 0.25,
        minWidth: 0,
        color: 'text.primary',
        fontWeight: 600,
      }}
    >
      {from}
      <KkAvatar initials={incoming.initials} size="small" component="span" />
      <Box component="span">{incoming.name}</Box>
      {note}
    </Stack>
  );
};
