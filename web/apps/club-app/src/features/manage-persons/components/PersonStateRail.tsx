import { KkStateRail } from '@furria/ui';
import type { FC } from 'react';
import { usePersonStateRail } from '../hooks/use-person-state-rail';
import type { PersonDetails } from '../schemas';
import { PersonAppActButton } from './PersonAppActButton';

const RAIL_LABEL = 'Überblick';
const APP_LABEL = 'App';
const JUMP_HINT = 'zum Abschnitt springen';

interface PersonStateRailProps {
  person: PersonDetails;
}

export const PersonStateRail: FC<PersonStateRailProps> = ({ person }) => {
  const rail = usePersonStateRail(person);

  const action =
    rail.act === null ? null : (
      <PersonAppActButton act={rail.act} personId={person.personId} onUnlock={rail.jumpToApp} />
    );

  const tiles = rail.tiles.map((tile) => {
    const jump = (): void => rail.jumpTo(tile.section);

    return (
      <KkStateRail.Tile
        key={tile.label}
        label={tile.label}
        value={tile.value}
        detail={tile.detail}
        tone={tile.tone}
        jumpLabel={`${tile.label}: ${tile.value} – ${JUMP_HINT}`}
        onJump={jump}
      />
    );
  });

  return (
    <KkStateRail label={RAIL_LABEL}>
      <KkStateRail.Lead
        label={APP_LABEL}
        value={rail.lead.value}
        detail={rail.lead.detail}
        tone={rail.lead.tone}
        dashed={rail.lead.dashed}
        jumpLabel={`${APP_LABEL}: ${rail.lead.value} – ${JUMP_HINT}`}
        onJump={rail.jumpToApp}
        action={action}
      />
      <KkStateRail.Tiles>{tiles}</KkStateRail.Tiles>
    </KkStateRail>
  );
};
