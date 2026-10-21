import { describe, expect, it } from 'vitest';
import type { ArtAnchor, KkPosterPhase, MotifPlacement, PosterTint } from './poster-composition';
import { artCompositionOf, posterInksOf, posterTintOf, screenPitchOf } from './poster-composition';

describe('artCompositionOf', () => {
  it.each<KkPosterPhase>(['runUp', 'opening', 'hall', 'hotDays', 'ashWednesday', 'offSeason'])(
    'lays the phone art down the page, the first motif behind the greeting (%s)',
    (phase) => {
      const phone = artCompositionOf(phase, 1).filter((placement) => placement.view === 'phone');
      const depths = phone.map((placement) => placement.y);

      expect(new Set(phone.map((placement) => placement.anchor))).toEqual(new Set(['page']));
      expect(depths[0]).toBe(Math.min(...depths));
      expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(150);
    },
  );

  it('keeps the desk art on the viewport', () => {
    const anchors = new Set<ArtAnchor>(
      artCompositionOf('hall', 0)
        .filter((placement) => placement.view === 'desk')
        .map((placement) => placement.anchor),
    );

    expect([...anchors]).toEqual(['view']);
  });

  it.each([
    [0, 0.55],
    [1, 1],
  ])('lets the eleven grow with a run-up share of %d', (runUp, strength) => {
    const eleven = artCompositionOf('runUp', runUp).find(
      (placement) => placement.motif === 'eleven' && placement.view === 'phone',
    );

    expect(eleven?.strength).toBeCloseTo(strength, 5);
  });
});

describe('posterTintOf', () => {
  it.each<[KkPosterPhase, boolean, PosterTint]>([
    ['runUp', false, 'red'],
    ['hotDays', false, 'red'],
    ['ashWednesday', false, 'ash'],
    ['offSeason', false, 'clear'],
    ['ashWednesday', true, 'gold'],
    ['runUp', true, 'gold'],
  ])('tints the %s glass (birthday %s)', (phase, foil, tint) => {
    expect(posterTintOf(phase, foil)).toBe(tint);
  });
});

describe('screenPitchOf', () => {
  const placement = (view: MotifPlacement['view'], width: number, cap: number): MotifPlacement => ({
    key: 'k',
    motif: 'eleven',
    view,
    x: 0,
    y: 0,
    width,
    cap,
    rotate: 0,
    strength: 1,
  });

  it.each([
    [placement('phone', 100, 40), 3.3846],
    [placement('desk', 40, 100), 2.9167],
    [placement('desk', 40, 20), 5.25],
  ])('keeps the dot screen near a constant pixel pitch', (input, pitch) => {
    expect(screenPitchOf(input)).toBeCloseTo(pitch, 3);
  });
});

describe('posterInksOf', () => {
  it.each<[KkPosterPhase, boolean, Record<'red' | 'ink' | 'gold', number>]>([
    ['hall', false, { red: 1, ink: 1, gold: 1 }],
    ['hall', true, { red: 1, ink: 1.6, gold: 1 }],
    ['opening', false, { red: 1.7, ink: 1.7, gold: 1.7 }],
    ['ashWednesday', true, { red: 0, ink: 1.6, gold: 0 }],
    ['offSeason', false, { red: 1, ink: 1, gold: 0 }],
    ['offSeason', true, { red: 1, ink: 1.6, gold: 1 }],
  ])('inks the %s plates (evening %s)', (phase, evening, inks) => {
    const printed = posterInksOf(phase, evening);

    expect(printed.red).toBeCloseTo(inks.red, 5);
    expect(printed.ink).toBeCloseTo(inks.ink, 5);
    expect(printed.gold).toBeCloseTo(inks.gold, 5);
  });
});
