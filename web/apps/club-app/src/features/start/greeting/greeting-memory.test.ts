import { describe, expect, it } from 'vitest';
import type { GreetingMemory } from './greeting-memory';
import { nextGreetingMemory, parseGreetingMemory } from './greeting-memory';

describe('parseGreetingMemory', () => {
  it.each([
    { label: 'nothing is stored', raw: null, expected: null },
    { label: 'the value is not JSON', raw: '{nope', expected: null },
    {
      label: 'an older shape is stored',
      raw: '{"v":0,"key":"daily:2027-01-19","cells":["TAG"]}',
      expected: null,
    },
    {
      label: 'the cells are not words',
      raw: '{"v":1,"key":"daily:2027-01-19","cells":[7]}',
      expected: null,
    },
    {
      label: 'a settled board is stored',
      raw: '{"v":1,"key":"daily:2027-01-19","cells":["TAG","7","0"]}',
      expected: { v: 1, key: 'daily:2027-01-19', cells: ['TAG', '7', '0'] },
    },
    {
      label: 'the board remembers its burst',
      raw: '{"v":1,"key":"carnivalCall:2026-11-11","cells":["GROSS"],"burstYear":2026}',
      expected: { v: 1, key: 'carnivalCall:2026-11-11', cells: ['GROSS'], burstYear: 2026 },
    },
  ])('reads $expected when $label', ({ raw, expected }) => {
    expect(parseGreetingMemory(raw)).toEqual(expected);
  });
});

describe('nextGreetingMemory', () => {
  const act = { key: 'carnivalCall:2026-11-11', sessionYear: 2026 };
  const cells = ['GROSS', '-', 'FURRIA!'];

  it.each<{
    label: string;
    previous: GreetingMemory | null;
    burst: boolean;
    expected: GreetingMemory;
  }>([
    {
      label: 'the first board settles',
      previous: null,
      burst: false,
      expected: { v: 1, key: act.key, cells },
    },
    {
      label: 'the burst fired',
      previous: { v: 1, key: 'daily:2026-11-10', cells: ['MORGEN'], burstYear: 2025 },
      burst: true,
      expected: { v: 1, key: act.key, cells, burstYear: 2026 },
    },
    {
      label: 'an earlier burst is kept',
      previous: { v: 1, key: 'daily:2026-11-10', cells: ['MORGEN'], burstYear: 2025 },
      burst: false,
      expected: { v: 1, key: act.key, cells, burstYear: 2025 },
    },
  ])('remembers the board when $label', ({ previous, burst, expected }) => {
    expect(nextGreetingMemory(previous, act, cells, burst)).toEqual(expected);
  });
});
