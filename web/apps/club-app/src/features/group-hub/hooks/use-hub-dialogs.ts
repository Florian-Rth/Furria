import { useState } from 'react';
import type { HubMember } from '../schemas';

export interface HubDialogs {
  isAddMemberOpen: boolean;
  endMember: HubMember | null;
  openAddMember: () => void;
  openEndMembership: (groupMembershipId: number) => void;
  close: () => void;
}

export const useHubDialogs = (members: readonly HubMember[]): HubDialogs => {
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [endMembershipId, setEndMembershipId] = useState<number | null>(null);

  const openAddMember = (): void => {
    setEndMembershipId(null);
    setAddMemberOpen(true);
  };

  const openEndMembership = (groupMembershipId: number): void => {
    setAddMemberOpen(false);
    setEndMembershipId(groupMembershipId);
  };

  const close = (): void => {
    setAddMemberOpen(false);
    setEndMembershipId(null);
  };

  const endMember = members.find((member) => member.groupMembershipId === endMembershipId) ?? null;

  return { isAddMemberOpen, endMember, openAddMember, openEndMembership, close };
};
