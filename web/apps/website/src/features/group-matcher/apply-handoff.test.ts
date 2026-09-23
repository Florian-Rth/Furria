import { describe, expect, it } from 'vitest';
import type { Group } from '@/lib/seed/groups';
import {
  APPLY_PATH,
  buildApplyHref,
  HANDOFF_GROUP_LIMIT,
  selectHandoffGroups,
} from './apply-handoff';
import type { GroupMatch } from './scoring';

const buildMatch = (id: string, percentage: number): GroupMatch => {
  const group: Group = {
    id,
    name: id.toUpperCase(),
    ageRange: { from: 6, to: null },
    isRecruiting: true,
    tagline: 'Ergebniszeile',
  };

  return { group, score: percentage / 100, percentage };
};

const matches: GroupMatch[] = [
  buildMatch('alpha', 90),
  buildMatch('beta', 80),
  buildMatch('gamma', 70),
  buildMatch('delta', 60),
];

describe('selectHandoffGroups', () => {
  it('hands the application the best matches in ranking order', () => {
    expect(selectHandoffGroups(matches).map((group) => group.id)).toEqual([
      'alpha',
      'beta',
      'gamma',
    ]);
  });

  it('never hands over more groups than the limit', () => {
    expect(selectHandoffGroups(matches)).toHaveLength(HANDOFF_GROUP_LIMIT);
  });

  it('hands over what there is when fewer groups matched', () => {
    expect(selectHandoffGroups(matches.slice(0, 1)).map((group) => group.id)).toEqual(['alpha']);
  });
});

describe('buildApplyHref', () => {
  it('carries the groups as one comma-separated search param', () => {
    expect(buildApplyHref(['alpha', 'beta'])).toBe('/join/apply?groups=alpha,beta');
  });

  it('links to the plain application when there is nothing to carry', () => {
    expect(buildApplyHref([])).toBe(APPLY_PATH);
  });

  it('escapes an id that would break the url', () => {
    expect(buildApplyHref(['alpha beta'])).toBe('/join/apply?groups=alpha%20beta');
  });
});
