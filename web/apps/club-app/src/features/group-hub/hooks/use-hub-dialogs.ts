import { useState } from 'react';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';

type HubDialogKind = 'none' | 'addMember';

export interface HubDialogs {
  isAddMemberOpen: boolean;
  promoteMember: GroupDetailMember | null;
  endMember: GroupDetailMember | null;
  endAdmin: GroupDetailAdmin | null;
  openAddMember: () => void;
  openPromote: (personId: number) => void;
  openEndMembership: (groupMembershipId: number) => void;
  openEndAdmin: (groupAdminId: number) => void;
  close: () => void;
}

export const useHubDialogs = (
  members: readonly GroupDetailMember[],
  admins: readonly GroupDetailAdmin[],
): HubDialogs => {
  const [kind, setKind] = useState<HubDialogKind>('none');
  const [endMembershipId, setEndMembershipId] = useState<number | null>(null);
  const [endAdminId, setEndAdminId] = useState<number | null>(null);
  const [promotePersonId, setPromotePersonId] = useState<number | null>(null);

  const clearRows = (): void => {
    setEndMembershipId(null);
    setEndAdminId(null);
    setPromotePersonId(null);
  };

  const openAddMember = (): void => {
    clearRows();
    setKind('addMember');
  };

  const openPromote = (personId: number): void => {
    setKind('none');
    clearRows();
    setPromotePersonId(personId);
  };

  const openEndMembership = (groupMembershipId: number): void => {
    setKind('none');
    clearRows();
    setEndMembershipId(groupMembershipId);
  };

  const openEndAdmin = (groupAdminId: number): void => {
    setKind('none');
    clearRows();
    setEndAdminId(groupAdminId);
  };

  const close = (): void => {
    setKind('none');
    clearRows();
  };

  const endMember = members.find((member) => member.groupMembershipId === endMembershipId) ?? null;
  const endAdmin = admins.find((admin) => admin.groupAdminId === endAdminId) ?? null;
  const promoteMember = members.find((member) => member.personId === promotePersonId) ?? null;

  return {
    isAddMemberOpen: kind === 'addMember',
    promoteMember,
    endMember,
    endAdmin,
    openAddMember,
    openPromote,
    openEndMembership,
    openEndAdmin,
    close,
  };
};
