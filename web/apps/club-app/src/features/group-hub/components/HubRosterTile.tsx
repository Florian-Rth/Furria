import { KkGroupTile, useKkSheetCommands } from '@furria/ui';
import Box from '@mui/material/Box';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupDetailMember } from '@/features/group-detail';
import type { GroupTone } from '@/features/groups';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { toMemberSinceLine, toRosterTap } from '../group-hub-labels';
import { HubCelebration } from './HubCelebration';

const MEMBER_PATH = '/members/$personId';

interface HubRosterTileProps {
  tone: GroupTone;
  member: GroupDetailMember;
  canManage: boolean;
  viewerIsAffiliated: boolean;
  isNew: boolean;
  fireKey: number;
}

export const HubRosterTile: FC<HubRosterTileProps> = ({
  tone,
  member,
  canManage,
  viewerIsAffiliated,
  isNew,
  fireKey,
}) => {
  const sheet = useKkSheetCommands();
  const name = `${member.firstName} ${member.lastName}`;
  const tap = toRosterTap(canManage, viewerIsAffiliated, member.isAffiliated);

  const peek = (): void => {
    sheet.open(toPeekId('member', member.personId));
  };

  const link =
    tap === 'person'
      ? { component: Link, to: MEMBER_PATH, params: { personId: String(member.personId) } }
      : { onClick: peek };

  const burst = isNew ? <HubCelebration fireKey={fireKey} /> : null;

  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      <KkGroupTile
        {...link}
        tone={tone}
        initials={toInitials(member.firstName, member.lastName)}
        name={name}
        meta={canManage ? toMemberSinceLine(member.since) : undefined}
      />
      {burst}
    </Box>
  );
};
