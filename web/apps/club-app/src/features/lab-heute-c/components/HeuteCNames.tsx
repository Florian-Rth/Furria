import { KkChip } from '@furria/ui/KkChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CAST_LABEL } from '../heute-c-copy';
import type { HeuteCName } from '../hooks/use-heute-c';
import { HeuteCNameChip } from './HeuteCNameChip';

interface HeuteCNamesProps {
  names: readonly HeuteCName[];
}

export const HeuteCNames: FC<HeuteCNamesProps> = ({ names }) => {
  const chips = names.map((person) => <HeuteCNameChip key={person.key} person={person} />);
  const none = names.length === 0 ? <KkChip size="small">—</KkChip> : null;

  return (
    <Stack
      component="ul"
      direction="row"
      aria-label={CAST_LABEL}
      sx={{
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        gap: 0.5,
        m: 0,
        p: 0,
        listStyle: 'none',
        minHeight: 0,
        overflowY: 'auto',
      }}
    >
      {chips}
      {none}
    </Stack>
  );
};
