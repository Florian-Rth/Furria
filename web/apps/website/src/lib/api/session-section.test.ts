import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { SessionSectionSchema } from './session-section';

describe('SessionSectionSchema', () => {
  it.each([
    [2025, 67, { startYear: 2025, yearsLabel: '2025/26', number: 67 }],
    [1999, null, { startYear: 1999, yearsLabel: '1999/00', number: null }],
  ])('folds session %i Nº %s into one session beside the items', (startYear, number, session) => {
    const section = SessionSectionSchema({ items: z.array(z.number()) }).parse({
      sessionStartYear: startYear,
      sessionNumber: number,
      items: [3, 1],
    });

    expect(section).toEqual({ items: [3, 1], session });
  });
});
