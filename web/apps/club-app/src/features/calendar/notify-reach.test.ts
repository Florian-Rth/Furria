import { describe, expect, it } from 'vitest';
import {
  isAskableReach,
  reachesWhatsAppGroup,
  toNotifyReach,
  toNotifyReachPath,
} from './notify-reach';

describe('toNotifyReach', () => {
  it.each([
    [[], false],
    [[{ kind: 'participatingGroups' }, { kind: 'daySchedule' }], false],
    [[{ kind: 'attendance' }], true],
    [[{ kind: 'poll' }], true],
    [[{ kind: 'signUpList' }], true],
  ] as const)('asks for an answer with add-ons %j: %s', (addOns, asks) => {
    expect(
      toNotifyReach(
        { audience: 'club', audienceGroupIds: [], audiencePersonIds: [], addOns },
        { state: 'ready', groups: [] },
      ),
    ).toEqual({ audience: 'club', asks });
  });

  it('names the chosen groups in German order', () => {
    expect(
      toNotifyReach(
        { audience: 'groups', audienceGroupIds: ['3', '5'], audiencePersonIds: [], addOns: [] },
        {
          state: 'ready',
          groups: [
            { groupId: 3, name: 'Tanzgarde' },
            { groupId: 5, name: 'Showtanz' },
            { groupId: 8, name: 'Elferrat' },
          ],
        },
      ),
    ).toEqual({ audience: 'groups', groupNames: ['Showtanz', 'Tanzgarde'], asks: false });
  });

  it('names no group when the groups could not be loaded', () => {
    expect(
      toNotifyReach(
        {
          audience: 'groups',
          audienceGroupIds: ['3'],
          audiencePersonIds: [],
          addOns: [{ kind: 'poll' }],
        },
        { state: 'failed' },
      ),
    ).toEqual({ audience: 'groups', groupNames: [], asks: true });
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

describe('toNotifyReachPath', () => {
  it('repeats each group and person', () => {
    expect(
      toNotifyReachPath({
        kind: 'training',
        audience: 'groups',
        audienceGroupIds: [3, 5],
        audiencePersonIds: [],
      }),
    ).toBe(
      '/api/calendar/notify-reach?kind=training&audience=groups&audienceGroupIds=3&audienceGroupIds=5',
    );
  });
});

describe('isAskableReach', () => {
  it.each([
    ['club', [], [], true],
    ['groups', [], [], false],
    ['groups', [3], [], true],
    ['people', [], [], false],
    ['people', [], [4], true],
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
    ['groups', true, false],
    ['people', true, false],
  ] as const)(
    'reaches the group for %s with a linked group %s: %s',
    (audience, linked, reaches) => {
      expect(reachesWhatsAppGroup(audience, linked)).toBe(reaches);
    },
  );
});
