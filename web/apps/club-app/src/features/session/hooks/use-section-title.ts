import { useLocation } from '@tanstack/react-router';
import { useMyGroupsQuery } from '@/features/group-hub';
import type { NavGroupRef } from '../app-sections';
import { resolveSectionTitle } from '../app-sections';

const NO_GROUPS: readonly NavGroupRef[] = [];

export const useSectionTitle = (): string => {
  const location = useLocation();
  const myGroups = useMyGroupsQuery();

  return resolveSectionTitle(location.pathname, myGroups.data?.groups ?? NO_GROUPS);
};
