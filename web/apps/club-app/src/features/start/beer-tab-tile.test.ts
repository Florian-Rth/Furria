import { describe, expect, it } from 'vitest';
import { beerTabLineOf, beerTabsOfStart, isBeerTabDue } from './beer-tab-tile';
import type { Start, StartBeerTab } from './schemas';

const NOW = new Date('2026-11-04T12:00:00Z');

describe('isBeerTabDue', () => {
  it.each([
    [['2026-10-28T12:00:00Z'], true],
    [['2026-10-28T12:00:01Z'], false],
    [['2026-11-03T12:00:00Z', '2026-10-20T12:00:00Z'], true],
    [[], false],
  ])('is due once an oldest open crate of %j is a week old', (bookedAts, expected) => {
    const tabs: StartBeerTab[] = bookedAts.map((oldestOpenBookedAt, index) => ({
      beerPotId: index + 1,
      openCrates: 1,
      openCents: 1500,
      oldestOpenBookedAt,
      owner: null,
      paymentLink: null,
    }));

    expect(isBeerTabDue(tabs, NOW)).toBe(expected);
  });
});

describe('beerTabLineOf', () => {
  it.each([
    ['https://paypal.me/greta', 'https://paypal.me/greta/26.00EUR'],
    [null, null],
  ])('asks PayPal for the open amount when the owner gave %s', (paymentLink, expected) => {
    const line = beerTabLineOf({
      beerPotId: 4,
      openCrates: 2,
      openCents: 2600,
      oldestOpenBookedAt: '2026-10-26T18:00:00+01:00',
      owner: { personId: 3, firstName: 'Greta', lastName: 'Gruber' },
      paymentLink,
    });

    expect(line.payHref).toBe(expected);
  });
});

describe('beerTabsOfStart', () => {
  const tab: StartBeerTab = {
    beerPotId: 2,
    openCrates: 1,
    openCents: 1800,
    oldestOpenBookedAt: '2026-11-01T10:00:00Z',
    owner: null,
    paymentLink: null,
  };
  const startWith = (panels: Start['panels']): Start => ({
    asOf: '2026-11-04T12:00:00Z',
    today: '2026-11-04',
    reshapeAt: null,
    viewerIsActiveInClub: true,
    panels,
  });

  it.each<{ label: string; start: Start; expected: StartBeerTab[] }>([
    {
      label: 'the open tabs of the tab panel',
      start: startWith([{ kind: 'beerTab', shownCount: 1, beerTabs: [tab] }]),
      expected: [tab],
    },
    { label: 'none without a tab panel', start: startWith([]), expected: [] },
  ])('$label', ({ start, expected }) => {
    expect(beerTabsOfStart(start)).toEqual(expected);
  });
});
