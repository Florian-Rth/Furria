import { useNavigate, useSearch } from '@tanstack/react-router';
import type { Transition } from 'motion/react';
import type { PublicGroup } from '@/lib/public-groups/schemas';

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
  const navigate = useNavigate();
  const { group: openGroupId } = useSearch({ strict: false });
  const index = groups.findIndex((group) => group.groupId === openGroupId);
  const active = groups[index];
  const activeGroup = active === undefined ? null : { group: active, index };

  const showGroup = (groupId: number | undefined, replace: boolean): void => {
    void navigate({ to: '.', search: { group: groupId }, replace, resetScroll: false });
  };

  return {
    activeGroup,
    openGroup: (groupId: number): void => showGroup(groupId, false),
    close: (): void => showGroup(undefined, true),
  };
};
