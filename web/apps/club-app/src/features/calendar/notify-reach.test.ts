import { describe, expect, it } from 'vitest';
import { isAskableReach, reachesWhatsAppGroup, toNotifyReach } from './notify-reach';

describe('toNotifyReach', () => {
  it.each([
    [[{ kind: 'participatingGroups' }, { kind: 'daySchedule' }], false],
    [[{ kind: 'attendance' }], true],
  ] as const)('asks for an answer with add-ons %j: %s', (addOns, asks) => {
    expect(
      toNotifyReach(
        { audience: 'club', audienceGroupIds: [], audiencePersonIds: [], addOns },
        { state: 'ready', groups: [] },
      ),
    ).toEqual({ audience: 'club', asks });
  });

  it('counts each chosen person once', () => {
    expect(
      toNotifyReach(
        {
          audience: 'people',
          audienceGroupIds: [],
          audiencePersonIds: ['4', '9', '4'],
          addOns: [],
        },
        { state: 'ready', groups: [] },
      ),
    ).toEqual({ audience: 'people', count: 2, asks: false });
  });
});

describe('isAskableReach', () => {
  it.each([
    ['groups', [], [], false],
    ['groups', [3], [], true],
  ] as const)(
    'asks for %s with groups %j and people %j: %s',
    (audience, groupIds, personIds, askable) => {
      expect(
        isAskableReach({
          kind: 'plain',
          audience,
          audienceGroupIds: groupIds,
          audiencePersonIds: personIds,
        }),
      ).toBe(askable);
    },
  );
});

describe('reachesWhatsAppGroup', () => {
  it.each([
    ['club', true, true],
    ['club', false, false],
  ] as const)(
    'reaches the group for %s with a linked group %s: %s',
    (audience, linked, reaches) => {
      expect(reachesWhatsAppGroup(audience, linked)).toBe(reaches);
    },
  );
});
