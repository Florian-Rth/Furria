import { KkChip } from '@furria/ui/KkChip';
import type { FC } from 'react';
import { STAND_IN_MARK } from '../heute-c-copy';
import type { HeuteCName } from '../hooks/use-heute-c';

interface HeuteCNameChipProps {
  person: HeuteCName;
}

export const HeuteCNameChip: FC<HeuteCNameChipProps> = ({ person }) => {
  const tone = person.standsIn ? 'blue' : 'neutral';
  const text = person.standsIn ? `${person.name} · ${STAND_IN_MARK}` : person.name;

  return (
    <li>
      <KkChip tone={tone} dot={person.standsIn} size="small">
        {text}
      </KkChip>
    </li>
  );
};
