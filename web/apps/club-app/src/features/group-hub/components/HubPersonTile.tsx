import { KkGroupTile, useKkSheetCommands } from '@furria/ui';
import Box from '@mui/material/Box';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toPersonAccent, toPersonMetaLine, toPersonTap } from '../group-hub-labels';
import type { HubPerson } from '../hub-people';
import { HubCelebration } from './HubCelebration';

const MEMBER_PATH = '/members/$personId';

interface HubPersonTileProps {
  tone: GroupTone;
  person: HubPerson;
  canManage: boolean;
  viewerIsAffiliated: boolean;
  isNew: boolean;
  fireKey: number;
}

export const HubPersonTile: FC<HubPersonTileProps> = ({
  tone,
  person,
  canManage,
  viewerIsAffiliated,
  isNew,
  fireKey,
}) => {
  const sheet = useKkSheetCommands();
  const name = `${person.firstName} ${person.lastName}`;
  const tap = toPersonTap(canManage, viewerIsAffiliated, person.isAffiliated);

  const peek = (): void => {
    sheet.open(toPeekId('member', person.personId));
  };

  const link =
    tap === 'person'
      ? { component: Link, to: MEMBER_PATH, params: { personId: String(person.personId) } }
      : { onClick: peek };

  const burst = isNew ? <HubCelebration fireKey={fireKey} /> : null;

  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      <KkGroupTile
        {...link}
        tone={tone}
        initials={toInitials(person.firstName, person.lastName)}
        name={name}
        accent={toPersonAccent(person)}
        meta={toPersonMetaLine(person, canManage)}
      />
      {burst}
    </Box>
  );
};
