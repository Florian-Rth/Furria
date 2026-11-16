import { describe, expect, it } from 'vitest';
import { toNotifyReach } from './notify-reach';

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
