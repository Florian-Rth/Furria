import type { Transition } from 'motion/react';
import { useState } from 'react';
import type { Group } from '@/features/club/groups-content';

export interface ActiveGroup {
  group: Group;
  index: number;
}

export interface GroupModalState {
  activeGroup: ActiveGroup | null;
  openGroup: (id: string) => void;
  close: () => void;
}

export const resolveModalTransition = (reducedMotion: boolean | null): Transition =>
  reducedMotion === true
    ? { duration: 0 }
    : { type: 'spring', stiffness: 360, damping: 30, mass: 0.8 };

export const useGroupModal = (groups: Group[]): GroupModalState => {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const index = groups.findIndex((group) => group.title === openGroupId);
  const active = groups[index];
  const activeGroup = active === undefined ? null : { group: active, index };

  return {
    activeGroup,
    openGroup: (id: string): void => setOpenGroupId(id),
    close: (): void => setOpenGroupId(null),
  };
};
