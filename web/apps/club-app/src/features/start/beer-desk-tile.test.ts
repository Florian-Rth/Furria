import { describe, expect, it } from 'vitest';
import { withBeerDesk } from './beer-desk-tile';
import type { BoardPanel } from './schemas';

const calendar: BoardPanel = {
  kind: 'calendar',
  shownCount: 0,
  entries: [],
  announcementAddOns: [],
};
const practice: BoardPanel = { kind: 'practice', shownCount: 0, acts: [] };
const gallery: BoardPanel = { kind: 'gallery', shownCount: 0, albums: [] };

describe('withBeerDesk', () => {
  it.each<{ label: string; panels: BoardPanel[]; potId: number | null; kinds: string[] }>([
    {
      label: 'no pot is open',
      panels: [calendar, gallery],
      potId: null,
      kinds: ['calendar', 'gallery'],
    },
    {
      label: 'a pot is open, after the calendar',
      panels: [calendar, gallery],
      potId: 4,
      kinds: ['calendar', 'beerDesk', 'gallery'],
    },
    {
      label: 'a pot is open, after calendar and practice',
      panels: [calendar, practice, gallery],
      potId: 4,
      kinds: ['calendar', 'practice', 'beerDesk', 'gallery'],
    },
    {
      label: 'a pot is open on a board without leading tiles',
      panels: [gallery],
      potId: 4,
      kinds: ['beerDesk', 'gallery'],
    },
  ])('places the desk when $label', ({ panels, potId, kinds }) => {
    expect(withBeerDesk(panels, potId).map((panel) => panel.kind)).toEqual(kinds);
  });
});
