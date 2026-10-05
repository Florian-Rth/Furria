import { describe, expect, it } from 'vitest';
import { StartSchema } from './schemas';

const PAYLOAD_HEAD = {
  asOf: '2027-01-19T18:50:00+00:00',
  today: '2027-01-19',
  reshapeAt: null,
  viewerIsActiveInClub: true,
};

describe('StartSchema', () => {
  it.each([
    {
      label: 'a panel kind arrived after this app was built',
      panels: [
        { kind: 'polls', shownCount: 1, polls: [{ pollId: 3 }] },
        { kind: 'toDos', shownCount: 1, toDos: [{ kind: 'reminderDue', count: 12 }] },
      ],
      expected: [{ kind: 'toDos', shownCount: 1, toDos: [{ kind: 'reminderDue', count: 12 }] }],
    },
    {
      label: 'a to-do kind arrived after this app was built',
      panels: [
        {
          kind: 'toDos',
          shownCount: 2,
          toDos: [
            { kind: 'expenseWaiting', count: 2 },
            { kind: 'clubRecordGap', count: 1 },
          ],
        },
      ],
      expected: [{ kind: 'toDos', shownCount: 2, toDos: [{ kind: 'clubRecordGap', count: 1 }] }],
    },
    {
      label: 'a group moment kind arrived after this app was built',
      panels: [{ kind: 'groups', shownCount: 1, groupMoments: [{ kind: 'notice', groupId: 6 }] }],
      expected: [{ kind: 'groups', shownCount: 1, groupMoments: [] }],
    },
  ])('keeps only what it knows when $label', ({ panels, expected }) => {
    expect(StartSchema.parse({ ...PAYLOAD_HEAD, panels }).panels).toEqual(expected);
  });
});
