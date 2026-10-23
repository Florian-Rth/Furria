import { toImageSource } from '@furria/ui/image-source';
import { KkAvatarStack } from '@furria/ui/KkAvatarStack';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { toInitials } from '@/lib/initials';
import { toCastFact, toRunsFact } from '../acts-copy';

const FACES = 5;

interface ActsRowFactProps {
  act: CatalogueAct;
  runs: number;
}

export const ActsRowFact: FC<ActsRowFactProps> = ({ act, runs }) => {
  const initials = act.cast.map((person) => toInitials(person.firstName, person.lastName));
  const portraits = act.cast.map((person) => toImageSource(person.portrait, 'portrait'));
  const faces =
    act.cast.length === 0 ? null : (
      <KkAvatarStack initials={initials} portraits={portraits} max={FACES} />
    );
  const runsPart =
    runs === 0 ? null : (
      <Box component="span" data-kk-fact>
        {toRunsFact(runs)}
      </Box>
    );

  return (
    <>
      {faces}
      <Box component="span" data-kk-fact>
        {toCastFact(act.cast.length)}
      </Box>
      {runsPart}
    </>
  );
};
