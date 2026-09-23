import type { Transition } from 'motion/react';
import { useState } from 'react';
import type { PublicGroup } from '@/features/club/schemas';

export interface ActiveGroup {
  group: PublicGroup;
  index: number;
}

export interface GroupModalState {
  activeGroup: ActiveGroup | null;
  openGroup: (groupId: number) => void;
  close: () => void;
}

export const resolveModalTransition = (reducedMotion: boolean | null): Transition =>
  reducedMotion === true
    ? { duration: 0 }
    : { type: 'spring', stiffness: 360, damping: 30, mass: 0.8 };

export const useGroupModal = (groups: PublicGroup[]): GroupModalState => {
  const [openGroupId, setOpenGroupId] = useState<number | null>(null);
  const index = groups.findIndex((group) => group.groupId === openGroupId);
  const active = groups[index];
  const activeGroup = active === undefined ? null : { group: active, index };

  return {
    activeGroup,
    openGroup: (groupId: number): void => setOpenGroupId(groupId),
    close: (): void => setOpenGroupId(null),
  };
};
