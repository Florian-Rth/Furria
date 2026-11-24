import { describe, expect, it } from 'vitest';
import type { CalendarAudienceChoice, CalendarOwnerOption } from './calendar-owner';
import { toChoiceForKind, toDerivedOwnerId } from './calendar-owner';

const CLUB_MANAGER: CalendarOwnerOption[] = [
  { id: 'club', ownerGroupId: null, label: 'Verein' },
  { id: '7', ownerGroupId: 7, label: 'Tanzgarde' },
];

const GROUP_ADMIN: CalendarOwnerOption[] = [
  { id: '3', ownerGroupId: 3, label: 'Elferrat' },
  { id: '7', ownerGroupId: 7, label: 'Tanzgarde' },
];

const groups = (...groupIds: string[]): CalendarAudienceChoice => ({
  audience: 'groups',
  audienceGroupIds: groupIds,
  audiencePersonIds: [],
});

const CLUB: CalendarAudienceChoice = {
  audience: 'club',
  audienceGroupIds: [],
  audiencePersonIds: [],
};

describe('toDerivedOwnerId', () => {
  it.each<[string, CalendarAudienceChoice, string, CalendarOwnerOption[], string]>([
    ['one foreign group for a club manager', groups('9'), '7', CLUB_MANAGER, 'club'],
    ['several own groups keeping the preferred one', groups('3', '7'), '7', GROUP_ADMIN, '7'],
    ['several groups without the preferred one', groups('9', '3'), '7', GROUP_ADMIN, '3'],
  ])('owns %s', (_, choice, preferred, options, expected) => {
    expect(toDerivedOwnerId(choice, preferred, options, null)).toBe(expected);
  });

  it('keeps the held owner while the audience is the one it was saved with', () => {
    const held = { choice: groups('9', '7'), ownerId: '7' };

    expect(toDerivedOwnerId(groups('7', '9'), 'club', CLUB_MANAGER, held)).toBe('7');
  });

  it('derives anew once the audience differs from the saved one', () => {
    const held = { choice: groups('9'), ownerId: 'club' };

    expect(toDerivedOwnerId(groups('7'), 'club', CLUB_MANAGER, held)).toBe('7');
  });
});

describe('toChoiceForKind', () => {
  it.each([
    ['training', 'club', 'groups', []],
    ['training', '7', 'groups', ['7']],
  ] as const)('turns a club %s with owner %s into %s %j', (kind, ownerId, audience, groupIds) => {
    expect(toChoiceForKind(CLUB, kind, ownerId)).toEqual({
      audience,
      audienceGroupIds: groupIds,
      audiencePersonIds: [],
    });
  });
});
