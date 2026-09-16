import { useState } from 'react';
import type { GroupDetailAdmin, GroupDetailMember } from '@/features/group-detail';

export interface OverrideDialogs {
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

export const useOverrideDialogs = (
  members: readonly GroupDetailMember[],
  admins: readonly GroupDetailAdmin[],
): OverrideDialogs => {
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [isAddAdminOpen, setAddAdminOpen] = useState(false);
  const [endMembershipId, setEndMembershipId] = useState<number | null>(null);
  const [endAdminId, setEndAdminId] = useState<number | null>(null);

  const close = (): void => {
    setAddMemberOpen(false);
    setAddAdminOpen(false);
    setEndMembershipId(null);
    setEndAdminId(null);
  };

  const openAddMember = (): void => {
    close();
    setAddMemberOpen(true);
  };

  const openAddAdmin = (): void => {
    close();
    setAddAdminOpen(true);
  };

  const openEndMembership = (groupMembershipId: number): void => {
    close();
    setEndMembershipId(groupMembershipId);
  };

  const openEndAdmin = (groupAdminId: number): void => {
    close();
    setEndAdminId(groupAdminId);
  };

  return {
    isAddMemberOpen,
    isAddAdminOpen,
    endMember: members.find((row) => row.groupMembershipId === endMembershipId) ?? null,
    endAdmin: admins.find((row) => row.groupAdminId === endAdminId) ?? null,
    openAddMember,
    openAddAdmin,
    openEndMembership,
    openEndAdmin,
    close,
  };
};
