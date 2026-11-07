import type { JobView } from '@furria/studio/edit-jobs-view';
import { actionsIn, jobActionOf } from '@furria/studio/edit-jobs-view';
import { describe, expect, it } from 'vitest';

const ignore = (): void => undefined;

describe('actionsIn', () => {
  const view: JobView = {
    context: '',
    blocks: [
      {
        key: 'a',
        owner: '',
        title: '',
        meta: null,
        sections: [
          {
            kind: 'tools',
            key: 's1',
            title: null,
            aside: null,
            actions: [
              jobActionOf('line', '', 'line', ignore),
              jobActionOf('mirror', '', 'mirror', ignore),
            ],
          },
          { kind: 'note', key: 'n', text: '' },
        ],
        danger: jobActionOf('delete', '', 'delete', ignore, { tone: 'danger' }),
      },
      {
        key: 'b',
        owner: '',
        title: '',
        meta: null,
        sections: [
          {
            kind: 'tools',
            key: 's2',
            title: null,
            aside: null,
            actions: [jobActionOf('loop', '', 'loop', ignore)],
          },
        ],
        danger: null,
      },
    ],
    bar: [],
  };

  it('picks the panel actions in the asked order, across blocks and the destructive end', () => {
    expect(actionsIn(view, ['loop', 'delete', 'line']).map((action) => action.key)).toEqual([
      'loop',
      'delete',
      'line',
    ]);
  });

  it('skips keys the panel does not hold', () => {
    expect(actionsIn(view, ['circle', 'mirror']).map((action) => action.key)).toEqual(['mirror']);
  });
});
