import { KkAvatar, KkButton, KkGroupToneChip, KkMeta, KkNote, KkSheet } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';
import type { GroupTone } from '@/features/groups';
import { usePermissions } from '@/features/session';
import { toInitials } from '@/lib/initials';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import {
  HUB_PEEK_CLOSE_LABEL,
  HUB_PEEK_CONTACT_NOTE,
  HUB_PEEK_OPEN_LABEL,
  HUB_PEEK_UNREACHABLE_NOTE,
  toMemberSinceLine,
} from '../group-hub-labels';

const MEMBER_PATH = '/members/$personId';
const GROUP_ADMIN_LABEL = 'Gruppen-Admin';
const END_MEMBERSHIP_LABEL = 'Zugehörigkeit beenden';
const HEAD_GAP = 1.5;

const toPersonId = (member: GroupDetailMember): number => member.personId;

interface HubPeekSheetProps {
  tone: GroupTone;
  members: readonly GroupDetailMember[];
  admins: readonly GroupDetailAdmin[];
  canManage: boolean;
  onEnd: (groupMembershipId: number) => void;
}

export const HubPeekSheet: FC<HubPeekSheetProps> = ({
  tone,
  members,
  admins,
  canManage,
  onEnd,
}) => {
  const member = usePeek('member', members, toPersonId);
  const { isAffiliated } = usePermissions();

  if (member === null) {
    return null;
  }

  const name = `${member.firstName} ${member.lastName}`;
  const admin = admins.find((row) => row.personId === member.personId);
  const functionLabel = admin === undefined ? null : (admin.function ?? GROUP_ADMIN_LABEL);
  const canOpen = isAffiliated && member.isAffiliated;

  const end = (): void => {
    onEnd(member.groupMembershipId);
  };

  const functionChip =
    functionLabel === null ? null : <KkGroupToneChip tone={tone}>{functionLabel}</KkGroupToneChip>;

  const openAction = canOpen ? (
    <KkButton
      component={Link}
      to={MEMBER_PATH}
      params={{ personId: String(member.personId) }}
      fullWidth
    >
      {HUB_PEEK_OPEN_LABEL}
    </KkButton>
  ) : (
    <KkNote>{HUB_PEEK_UNREACHABLE_NOTE}</KkNote>
  );

  const endAction = canManage ? (
    <KkButton variant="outlined" tone="danger" onClick={end} fullWidth>
      {END_MEMBERSHIP_LABEL}
    </KkButton>
  ) : null;

  return (
    <KkSheet
      id={toPeekId('member', member.personId)}
      title={name}
      closeLabel={HUB_PEEK_CLOSE_LABEL}
    >
      <KkSheet.Body>
        <Stack direction="row" sx={{ alignItems: 'center', gap: HEAD_GAP, minWidth: 0 }}>
          <KkAvatar initials={toInitials(member.firstName, member.lastName)} size="large" />
          <Stack sx={{ minWidth: 0, gap: 0.5, alignItems: 'flex-start' }}>
            <KkMeta>{toMemberSinceLine(member.since)}</KkMeta>
            {functionChip}
          </Stack>
        </Stack>
        <KkNote>{HUB_PEEK_CONTACT_NOTE}</KkNote>
      </KkSheet.Body>
      <KkSheet.Actions>
        {openAction}
        {endAction}
      </KkSheet.Actions>
    </KkSheet>
  );
};
