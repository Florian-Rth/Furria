import { useState } from 'react';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';

type HubDialogKind = 'none' | 'addMember' | 'addAdmin';

export interface HubDialogs {
  isAddMemberOpen: boolean;
  isAddAdminOpen: boolean;
  endMember: GroupDetailMember | null;
  endAdmin: GroupDetailAdmin | null;
  openAddMember: () => void;
  openAddAdmin: () => void;
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

  const clearRows = (): void => {
    setEndMembershipId(null);
    setEndAdminId(null);
  };

  const openAddMember = (): void => {
    clearRows();
    setKind('addMember');
  };

  const openAddAdmin = (): void => {
    clearRows();
    setKind('addAdmin');
  };

  const openEndMembership = (groupMembershipId: number): void => {
    setKind('none');
    setEndAdminId(null);
    setEndMembershipId(groupMembershipId);
  };

  const openEndAdmin = (groupAdminId: number): void => {
    setKind('none');
    setEndMembershipId(null);
    setEndAdminId(groupAdminId);
  };

  const close = (): void => {
    setKind('none');
    clearRows();
  };

  const endMember = members.find((member) => member.groupMembershipId === endMembershipId) ?? null;
  const endAdmin = admins.find((admin) => admin.groupAdminId === endAdminId) ?? null;

  return {
    isAddMemberOpen: kind === 'addMember',
    isAddAdminOpen: kind === 'addAdmin',
    endMember,
    endAdmin,
    openAddMember,
    openAddAdmin,
    openEndMembership,
    openEndAdmin,
    close,
  };
};
