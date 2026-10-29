import { toImageSource } from '@furria/ui/image-source';
import { KkAvatarStack } from '@furria/ui/KkAvatarStack';
import { KkFactStrip } from '@furria/ui/KkFactStrip';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { toInitials } from '@/lib/initials';
import { ACT_FACTS_LABEL, actFactsOf, toActStateNote } from '../act-page-copy';
import { ActWishChips } from './ActWishChips';

const FACES = 8;

interface ActFactsProps {
  act: CatalogueAct;
}

export const ActFacts: FC<ActFactsProps> = ({ act }) => {
  const facts = actFactsOf(act).map((fact) => (
    <KkFactStrip.Fact key={fact.key} label={fact.label} value={fact.value} icon={fact.icon} />
  ));
  const initials = act.cast.map((person) => toInitials(person.firstName, person.lastName));
  const portraits = act.cast.map((person) => toImageSource(person.portrait, 'portrait'));
  const faces =
    act.cast.length === 0 ? null : (
      <KkAvatarStack initials={initials} portraits={portraits} max={FACES} />
    );
  const wishes = act.wishes.length === 0 ? null : <ActWishChips wishes={act.wishes} />;
  const stateNote = toActStateNote(act);
  const people =
    faces === null && wishes === null ? null : (
      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
        {faces}
        {wishes}
      </Stack>
    );
  const state = stateNote === null ? null : <KkMeta tone="accent">{stateNote}</KkMeta>;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }}>
      <KkFactStrip label={ACT_FACTS_LABEL}>{facts}</KkFactStrip>
      {people}
      {state}
    </Stack>
  );
};
