import { KkChip } from '@furria/ui/KkChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toCastInChip, toCastOutChip } from '../season-b-copy';

interface SeasonCastChangesProps {
  outNames: readonly string[];
  inNames: readonly string[];
}

export const SeasonCastChanges: FC<SeasonCastChangesProps> = ({ outNames, inNames }) => {
  const out = outNames.map((name) => (
    <KkChip key={`out:${name}`} tone="gold" size="small">
      {toCastOutChip(name)}
    </KkChip>
  ));
  const standIns = inNames.map((name) => (
    <KkChip key={`in:${name}`} tone="green" size="small">
      {toCastInChip(name)}
    </KkChip>
  ));

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, minWidth: 0 }}>
      {out}
      {standIns}
    </Stack>
  );
};
