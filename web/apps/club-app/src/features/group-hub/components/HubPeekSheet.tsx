import type { KkSheetAction } from '@furria/ui';
import { KkAvatar, KkGroupToneChip, KkMeta, KkNote, KkSheet } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
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
  PEEK_END_ADMIN_LABEL,
  PEEK_END_MEMBERSHIP_LABEL,
  PEEK_PROMOTE_LABEL,
  type PeekAdminIntent,
  toPeekAdminIntent,
  toPersonAccent,
  toPersonStandingLines,
} from '../group-hub-labels';
import type { HubPerson } from '../hub-people';

const MEMBER_PATH = '/members/$personId';
const HEAD_GAP = 1.5;

const toPersonId = (person: HubPerson): number => person.personId;

interface HubPeekSheetProps {
  tone: GroupTone;
  people: readonly HubPerson[];
  canManage: boolean;
  onPromote: (personId: number) => void;
  onEndMembership: (groupMembershipId: number) => void;
  onEndAdmin: (groupAdminId: number) => void;
}

export const HubPeekSheet: FC<HubPeekSheetProps> = ({
  tone,
  people,
  canManage,
  onPromote,
  onEndMembership,
  onEndAdmin,
}) => {
  const person = usePeek('member', people, toPersonId);
  const { isAffiliated } = usePermissions();

  if (person === null) {
    return null;
  }

  const name = `${person.firstName} ${person.lastName}`;
  const accent = toPersonAccent(person);
  const canOpen = isAffiliated && person.isAffiliated;
  const membershipId = person.groupMembershipId;
  const adminId = person.groupAdminId;

  const endMembership = (): void => {
    if (membershipId !== null) {
      onEndMembership(membershipId);
    }
  };

  const endAdmin = (): void => {
    if (adminId !== null) {
      onEndAdmin(adminId);
    }
  };

  const promote = (): void => {
    onPromote(person.personId);
  };

  const standing = toPersonStandingLines(person).map((line) => <KkMeta key={line}>{line}</KkMeta>);

  const functionChip =
    accent === undefined ? null : <KkGroupToneChip tone={tone}>{accent}</KkGroupToneChip>;

  const openAction: KkSheetAction | undefined = canOpen
    ? {
        label: HUB_PEEK_OPEN_LABEL,
        component: Link,
        to: MEMBER_PATH,
        params: { personId: String(person.personId) },
      }
    : undefined;

  const adminIntent = toPeekAdminIntent(person, canManage);

  const adminActions: Record<PeekAdminIntent, KkSheetAction | undefined> = {
    promote: { label: PEEK_PROMOTE_LABEL, onClick: promote },
    endAdmin: { label: PEEK_END_ADMIN_LABEL, tone: 'danger', onClick: endAdmin },
    none: undefined,
  };

  const endMembershipAction: KkSheetAction | undefined =
    canManage && membershipId !== null
      ? { label: PEEK_END_MEMBERSHIP_LABEL, tone: 'danger', onClick: endMembership }
      : undefined;

  const unreachableNote = canOpen ? null : <KkNote>{HUB_PEEK_UNREACHABLE_NOTE}</KkNote>;

  return (
    <KkSheet
      id={toPeekId('member', person.personId)}
      title={name}
      closeLabel={HUB_PEEK_CLOSE_LABEL}
    >
      <KkSheet.Body>
        <Stack direction="row" sx={{ alignItems: 'center', gap: HEAD_GAP, minWidth: 0 }}>
          <KkAvatar
            initials={toInitials(person.firstName, person.lastName)}
            size="large"
            tone={accent === undefined ? undefined : tone}
          />
          <Stack sx={{ minWidth: 0, gap: 0.5, alignItems: 'flex-start' }}>
            {standing}
            {functionChip}
          </Stack>
        </Stack>
        <KkNote>{HUB_PEEK_CONTACT_NOTE}</KkNote>
        {unreachableNote}
      </KkSheet.Body>
      <KkSheet.Actions
        primary={openAction}
        secondary={adminActions[adminIntent]}
        tertiary={endMembershipAction}
      />
    </KkSheet>
  );
};
