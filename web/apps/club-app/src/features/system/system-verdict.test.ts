import { describe, expect, it } from 'vitest';
import type { VerdictLevel, VerdictReason } from './schemas';
import type { ReasonCode } from './system-verdict';
import { areaLevelOf, areaOfCheck, reasonCodeOf, shownLevelOf } from './system-verdict';
import type { SystemArea } from './types';

const reason = (check: string, level: VerdictLevel): VerdictReason => ({
  check,
  level,
  code: 'any',
  value: null,
  subject: null,
});

describe('reasonCodeOf', () => {
  it.each<{ code: string; known: ReasonCode }>([
    { code: 'diskLow', known: 'diskLow' },
    { code: 'cosmicRay', known: 'unknown' },
  ])('$code reads as $known', ({ code, known }) => {
    expect(reasonCodeOf(code)).toBe(known);
  });
});

describe('areaOfCheck', () => {
  it.each<{ check: string; area: SystemArea | null }>([
    { check: 'workers', area: 'media' },
    { check: 'queue', area: 'media' },
    { check: 'logs', area: 'log' },
    { check: 'backup', area: null },
  ])('$check belongs to $area', ({ check, area }) => {
    expect(areaOfCheck(check)).toBe(area);
  });
});

describe('areaLevelOf', () => {
  it.each<{ label: string; reasons: VerdictReason[]; level: VerdictLevel }>([
    { label: 'is fine without reasons', reasons: [], level: 'ok' },
    {
      label: 'takes the worst reason of the area',
      reasons: [reason('queue', 'attention'), reason('workers', 'broken')],
      level: 'broken',
    },
    {
      label: 'ignores reasons of other areas',
      reasons: [reason('mail', 'broken'), reason('media', 'attention')],
      level: 'attention',
    },
  ])('$label', ({ reasons, level }) => {
    expect(areaLevelOf(reasons, 'media')).toBe(level);
  });
});

describe('shownLevelOf', () => {
  it.each<{ level: VerdictLevel; connected: boolean; shown: string }>([
    { level: 'ok', connected: true, shown: 'ok' },
    { level: 'ok', connected: false, shown: 'unknown' },
  ])('$level while connected=$connected shows $shown', ({ level, connected, shown }) => {
    expect(shownLevelOf(level, connected)).toBe(shown);
  });
});
