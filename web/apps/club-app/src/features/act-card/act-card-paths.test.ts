import { describe, expect, it } from 'vitest';
import type { ActPageSearch } from '@/features/acts/schemas';
import { actCardLinksOf, originSearchOf } from './act-card-paths';

describe('originSearchOf', () => {
  it('keeps how the act was reached and drops the view state', () => {
    const search: ActPageSearch = { from: 'group', group: 3, view: 'details', evening: 9 };

    expect(originSearchOf(search)).toEqual({ from: 'group', group: 3 });
  });
});

describe('actCardLinksOf', () => {
  it('opens player, studio, details and settings with the way back kept', () => {
    const links = actCardLinksOf(5, { from: 'start' });

    expect([links.play, links.edit, links.details, links.settings]).toEqual([
      { to: '/acts/$actId/practice', params: { actId: '5' }, search: { from: 'start' } },
      { to: '/acts/$actId/edit', params: { actId: '5' }, search: { from: 'start' } },
      { to: '/acts/$actId', params: { actId: '5' }, search: { from: 'start', view: 'details' } },
      {
        to: '/acts/$actId',
        params: { actId: '5' },
        search: { from: 'start', view: 'details', settings: true },
      },
    ]);
  });
});
