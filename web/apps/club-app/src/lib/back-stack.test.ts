import { describe, expect, it } from 'vitest';
import { leavesSheetOverScreen } from './back-stack';

describe('leavesSheetOverScreen', () => {
  it.each([
    {
      label: 'a link in a sheet over its screen opens another page',
      current: { pathname: '/start', search: '?sheet=entry-5' },
      behind: '/start',
      nextHref: '/groups/3',
      expected: true,
    },
    {
      label: 'a link in a sheet over its screen opens another page with a query',
      current: { pathname: '/start', search: '?sheet=entry-5' },
      behind: '/start',
      nextHref: '/calendar?view=list&day=2026-10-07',
      expected: true,
    },
    {
      label: 'the sheet was opened by a deep link with nothing behind',
      current: { pathname: '/start', search: '?sheet=entry-5' },
      behind: undefined,
      nextHref: '/groups/3',
      expected: false,
    },
    {
      label: 'the sheet was reached from another page',
      current: { pathname: '/start', search: '?sheet=entry-5' },
      behind: '/groups/3',
      nextHref: '/groups/3',
      expected: false,
    },
    {
      label: 'the navigation stays on the sheet screen',
      current: { pathname: '/members', search: '?q=anna&sheet=member-4' },
      behind: '/members',
      nextHref: '/members?q=anna&sheet=member-9',
      expected: false,
    },
    {
      label: 'no sheet is open',
      current: { pathname: '/members', search: '?q=anna' },
      behind: '/members',
      nextHref: '/members/4',
      expected: false,
    },
  ])('is $expected when $label', ({ current, behind, nextHref, expected }) => {
    expect(leavesSheetOverScreen(current, behind, nextHref)).toBe(expected);
  });
});
