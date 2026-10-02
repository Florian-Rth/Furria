import { describe, expect, it } from 'vitest';
import type { GreetingMoment } from './greeting-act';
import type { GreetingMemory } from './greeting-memory';
import type { GreetingPlayDecision } from './greeting-play';
import { greetingPlayOf } from './greeting-play';

interface PlayCase {
  label: string;
  act: { moment: GreetingMoment; key: string; sessionYear: number };
  memory: GreetingMemory | null;
  reducedMotion: boolean;
  cellCount: number;
  expected: GreetingPlayDecision;
}

const TODAY_KEY = 'daily:2027-01-19';
const YESTERDAY_KEY = 'daily:2027-01-18';
const CALL_KEY = 'carnivalCall:2026-11-11';
const DAILY = { moment: 'daily', key: TODAY_KEY, sessionYear: 2026 } as const;
const CALL = { moment: 'carnivalCall', key: CALL_KEY, sessionYear: 2026 } as const;
const COUNTDOWN = {
  moment: 'openingCountdown',
  key: 'openingCountdown:2026-11-11',
  sessionYear: 2026,
} as const;

describe('greetingPlayOf', () => {
  it.each<PlayCase>([
    {
      label: 'she prefers reduced motion',
      act: CALL,
      memory: null,
      reducedMotion: true,
      cellCount: 3,
      expected: { play: 'still', burst: false },
    },
    {
      label: 'the countdown runs',
      act: COUNTDOWN,
      memory: { v: 1, key: COUNTDOWN.key, cells: ['NOCH', '2', ':', '3', '7'] },
      reducedMotion: false,
      cellCount: 6,
      expected: { play: 'live', burst: false },
    },
    {
      label: 'the device remembers nothing',
      act: DAILY,
      memory: null,
      reducedMotion: false,
      cellCount: 6,
      expected: { play: 'full', burst: false },
    },
    {
      label: 'the board grew a cell since yesterday',
      act: DAILY,
      memory: { v: 1, key: YESTERDAY_KEY, cells: ['TAG', '9', 'DER', 'SESSION,', 'LENA.'] },
      reducedMotion: false,
      cellCount: 6,
      expected: { play: 'full', burst: false },
    },
    {
      label: 'she comes back on the same day',
      act: DAILY,
      memory: { v: 1, key: TODAY_KEY, cells: ['TAG', '7', '0', 'DER', 'SESSION,', 'LENA.'] },
      reducedMotion: false,
      cellCount: 6,
      expected: { play: 'nod', burst: false },
    },
    {
      label: 'she opens the first time today',
      act: DAILY,
      memory: { v: 1, key: YESTERDAY_KEY, cells: ['TAG', '6', '9', 'DER', 'SESSION,', 'LENA.'] },
      reducedMotion: false,
      cellCount: 6,
      expected: { play: 'daily', burst: false },
    },
    {
      label: 'the call sounds for the first time this session',
      act: CALL,
      memory: { v: 1, key: CALL_KEY, cells: ['GROSS', '-', 'FURRIA!'], burstYear: 2025 },
      reducedMotion: false,
      cellCount: 3,
      expected: { play: 'full', burst: true },
    },
    {
      label: 'the call sounds on a device that remembers nothing',
      act: CALL,
      memory: null,
      reducedMotion: false,
      cellCount: 3,
      expected: { play: 'full', burst: true },
    },
    {
      label: 'the call already burst on this device',
      act: CALL,
      memory: { v: 1, key: CALL_KEY, cells: ['GROSS', '-', 'FURRIA!'], burstYear: 2026 },
      reducedMotion: false,
      cellCount: 3,
      expected: { play: 'nod', burst: false },
    },
  ])('plays $expected.play when $label', ({ act, memory, reducedMotion, cellCount, expected }) => {
    expect(greetingPlayOf(act, memory, reducedMotion, cellCount)).toEqual(expected);
  });
});
