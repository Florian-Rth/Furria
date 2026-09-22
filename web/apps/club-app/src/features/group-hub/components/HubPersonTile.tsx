import { KkGroupTile } from '@furria/ui';
import Box from '@mui/material/Box';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupTone } from '@/features/groups';
import { toLandingKey } from '@/features/write';
import { toInitials } from '@/lib/initials';
import { toPersonAccent, toPersonMetaLine } from '../group-hub-labels';
import type { HubPerson } from '../hub-people';
import { HubCelebration } from './HubCelebration';

const PERSON_ROUTE = '/groups/$groupId/people/$personId';
const NO_FIRE = 0;

interface HubPersonTileProps {
  tone: GroupTone;
  person: HubPerson;
  groupId: number;
  canManage: boolean;
  highlightedKey: string | null;
}

export const HubPersonTile: FC<HubPersonTileProps> = ({
  tone,
  person,
  groupId,
  canManage,
  highlightedKey,
}) => {
  const name = `${person.firstName} ${person.lastName}`;
  const membershipId = person.groupMembershipId;
  const celebrates =
    membershipId !== null && highlightedKey === toLandingKey('membership', membershipId);
  const fireKey = celebrates && membershipId !== null ? membershipId : NO_FIRE;

  const burst = celebrates ? <HubCelebration fireKey={fireKey} /> : null;

  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      <KkGroupTile
        component={Link}
        to={PERSON_ROUTE}
        params={{ groupId: String(groupId), personId: String(person.personId) }}
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
