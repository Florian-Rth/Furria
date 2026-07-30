import type { Group } from '@/lib/seed/groups';

export const toggleGroupInterest = (selected: string[], groupId: string): string[] =>
  selected.includes(groupId) ? selected.filter((id) => id !== groupId) : [...selected, groupId];

export const selectGroupLabels = (groups: Group[], selected: string[]): string[] =>
  groups.filter((group) => selected.includes(group.id)).map((group) => group.name);
