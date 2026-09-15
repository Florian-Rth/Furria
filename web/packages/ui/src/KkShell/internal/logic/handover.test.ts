import { describe, expect, it } from 'vitest';
import { kkTokens } from '../../../tokens';
import { handoverAt } from './handover';

const { scrollTravel, headerDrift, titleRise } = kkTokens.shell;

const OFFSETS = [-240, 0, 1, 12, 24, 36, 40, 48, 60, 72, 96, 400];

describe('handoverAt', () => {
  it('shows the header and the bar at rest before the track moves', () => {
    expect(handoverAt(0)).toEqual({
      headerOpacity: 1,
      headerDrift: 0,
      restOpacity: 1,
      titleOpacity: 0,
      titleRise,
    });
  });

  it('has handed the title over once the travel is done', () => {
    expect(handoverAt(scrollTravel)).toEqual({
      headerOpacity: 0,
      headerDrift: -headerDrift,
      restOpacity: 0,
      titleOpacity: 1,
      titleRise: 0,
    });
  });

  it.each(OFFSETS)('never shows the title twice at offset %i', (scrollOffset) => {
    const handover = handoverAt(scrollOffset);

    expect(handover.headerOpacity * handover.titleOpacity).toBe(0);
  });

  it.each(OFFSETS)('keeps the bar leading one whole element at offset %i', (scrollOffset) => {
    const handover = handoverAt(scrollOffset);

    expect(handover.restOpacity + handover.titleOpacity).toBeCloseTo(1);
  });

  it('fades one way only, so scrolling up runs the handover backwards', () => {
    const climbing = [...OFFSETS]
      .sort((first, second) => first - second)
      .map((scrollOffset) => handoverAt(scrollOffset));
    const headerFade = climbing.map((handover) => handover.headerOpacity);
    const titleArrival = climbing.map((handover) => handover.titleOpacity);

    expect(headerFade).toEqual([...headerFade].sort((first, second) => second - first));
    expect(titleArrival).toEqual([...titleArrival].sort((first, second) => first - second));
  });

  it('empties the header before the bar title starts to arrive', () => {
    const handedOff = handoverAt(scrollTravel * 0.55);

    expect(handedOff.headerOpacity).toBeCloseTo(0);
    expect(handedOff.titleOpacity).toBeCloseTo(0);
  });

  it('drifts the header up as it fades', () => {
    const drifting = handoverAt(scrollTravel * 0.275);

    expect(drifting.headerOpacity).toBeCloseTo(0.5);
    expect(drifting.headerDrift).toBeCloseTo(-headerDrift / 2);
  });

  it('lets the bar title rise while it fades in', () => {
    const arriving = handoverAt(scrollTravel * 0.775);

    expect(arriving.titleOpacity).toBeCloseTo(0.5);
    expect(arriving.titleRise).toBeCloseTo(titleRise / 2);
  });
});

describe('handoverAt under reduced motion', () => {
  it('keeps the header at rest while the track has not moved', () => {
    expect(handoverAt(0, 'instant').headerOpacity).toBe(1);
  });

  it.each([1, 12, scrollTravel, scrollTravel * 40])(
    'snaps the title into the bar at offset %i',
    (scrollOffset) => {
      const handover = handoverAt(scrollOffset, 'instant');

      expect(handover.headerOpacity).toBe(0);
      expect(handover.titleOpacity).toBe(1);
      expect(handover.titleRise).toBe(0);
    },
  );
});
