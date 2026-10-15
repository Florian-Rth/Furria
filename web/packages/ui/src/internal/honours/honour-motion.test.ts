import { describe, expect, it } from 'vitest';
import { glintCueOf, pieceCueOf } from './honour-motion';

describe('pieceCueOf', () => {
  it.each([
    ['arrive', 0, 3, true, false, { motion: 'strike', delay: 0.12 }],
    ['arrive', 2, 3, true, false, { motion: 'strike', delay: 0.2 }],
    ['arrive', 4, 3, false, false, { motion: 'still', delay: 0 }],
    ['strike', 4, 5, true, false, { motion: 'slam', delay: 0 }],
    ['strike', 3, 5, true, false, { motion: 'still', delay: 0 }],
    ['forge', 0, 11, true, true, { motion: 'fade', delay: 0 }],
    ['forge', 0, 4, true, false, { motion: 'still', delay: 0 }],
    ['still', 0, 4, true, false, { motion: 'still', delay: 0 }],
  ] as const)('cues a %s piece %i of %i struck', (motion, order, struck, isMetal, isBand, cue) => {
    expect(pieceCueOf(motion, order, struck, isMetal, isBand)).toEqual(cue);
  });
});

describe('glintCueOf', () => {
  it.each([
    ['arrive', 11, 0.62],
    ['arrive', 1, 0.22],
    ['forge', 11, 0.18],
    ['still', 11, null],
    ['strike', 11, null],
  ] as const)('starts the %s glint after %i pieces at %s', (motion, struck, delay) => {
    const cue = glintCueOf(motion, struck);

    expect(cue === null ? cue : Number(cue.toFixed(2))).toBe(delay);
  });
});
