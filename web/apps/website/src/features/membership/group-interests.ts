import type { Group } from '@/lib/seed/groups';

export const toggleGroupInterest = (selected: string[], groupId: string): string[] =>
  selected.includes(groupId) ? selected.filter((id) => id !== groupId) : [...selected, groupId];

export const selectKnownGroupIds = (groups: Group[], selected: string[]): string[] =>
  selected.filter((id) => groups.some((group) => group.id === id));

export const selectGroupLabels = (groups: Group[], selected: string[]): string[] =>
  groups.filter((group) => selected.includes(group.id)).map((group) => group.name);
