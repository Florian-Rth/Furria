import { describe, expect, it } from 'vitest';
import { withManageToDoMark } from './manage-to-dos';

describe('withManageToDoMark', () => {
  it('marks the to-do of a loaded hub', () => {
    const hub = withManageToDoMark(
      {
        persons: null,
        groups: null,
        roles: null,
        board: null,
        clubRecord: null,
        sessions: null,
        venues: null,
        keys: null,
        accounts: null,
        applications: null,
        toDos: [{ kind: 'keyToTakeBack', count: 1, isSeen: false, newCount: 0, version: 'v1' }],
      },
      { kind: 'keyToTakeBack', version: 'v1', seen: true },
    );

    expect(hub?.toDos[0]?.isSeen).toBe(true);
  });

  it('leaves an unloaded hub unloaded', () => {
    expect(
      withManageToDoMark(undefined, { kind: 'keyToTakeBack', version: 'v1', seen: true }),
    ).toBeUndefined();
  });
});
