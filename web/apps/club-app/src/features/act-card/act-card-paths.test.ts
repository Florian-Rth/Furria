import { describe, expect, it } from 'vitest';
import { actCardLinksOf, originSearchOf } from './act-card-paths';

describe('originSearchOf', () => {
  it('keeps how the act was reached and drops the view state', () => {
    expect(
      originSearchOf({ from: 'group', group: 3, view: 'details', evening: 9, edit: true }),
    ).toEqual({ from: 'group', group: 3 });
  });
});

describe('actCardLinksOf', () => {
  it('opens player, studio, details and settings with the way back kept', () => {
    const links = actCardLinksOf(5, { from: 'start', training: 4 });

    expect([
      links.play.search,
      links.edit.search,
      links.details.search,
      links.settings.search,
    ]).toEqual([
      { from: 'start', view: 'play' },
      { from: 'start', view: 'play', edit: true },
      { from: 'start', view: 'details' },
      { from: 'start', view: 'details', settings: true },
    ]);
  });
});
