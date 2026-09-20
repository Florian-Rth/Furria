import { describe, expect, it } from 'vitest';
import { kkTokens } from '../../../tokens';
import { handoverAt } from './handover';
import { headerMotionOf } from './header-motion';

const { scrollTravel } = kkTokens.shell;
const OFFSETS = [0, 12, 24, 40, 72, 400];

describe('headerMotionOf', () => {
  it.each(OFFSETS)('holds a banner still at offset %i', (scrollOffset) => {
    expect(headerMotionOf('banner', handoverAt(scrollOffset))).toEqual({ opacity: 1, drift: 0 });
  });

  it('lets a title header leave with the handover', () => {
    const handover = handoverAt(scrollTravel);

    expect(headerMotionOf('title', handover)).toEqual({
      opacity: handover.headerOpacity,
      drift: handover.headerDrift,
    });
  });

  it('parts the two kinds only once the track has moved', () => {
    expect(headerMotionOf('title', handoverAt(0))).toEqual(headerMotionOf('banner', handoverAt(0)));
    expect(headerMotionOf('title', handoverAt(scrollTravel))).not.toEqual(
      headerMotionOf('banner', handoverAt(scrollTravel)),
    );
  });
});
