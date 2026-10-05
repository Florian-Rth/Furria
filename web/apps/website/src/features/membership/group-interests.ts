import type { PublicGroup } from '@/lib/public-groups/schemas';

export const toggleGroupInterest = (selected: number[], groupId: number): number[] =>
  selected.includes(groupId) ? selected.filter((id) => id !== groupId) : [...selected, groupId];

export const selectKnownGroupIds = (groups: PublicGroup[], selected: number[]): number[] =>
  selected.filter((id) => groups.some((group) => group.groupId === id));

export const selectGroupLabels = (groups: PublicGroup[], selected: number[]): string[] =>
  groups.filter((group) => selected.includes(group.groupId)).map((group) => group.name);
