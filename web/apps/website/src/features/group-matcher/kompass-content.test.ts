import { describe, expect, it } from 'vitest';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import {
  buildAnsweredSummary,
  buildProgressLabel,
  kompassIntro,
  kompassKicker,
  kompassStanceChoices,
  kompassTitle,
} from './kompass-content';

describe('buildProgressLabel', () => {
  it('counts the question the visitor is looking at', () => {
    expect(buildProgressLabel(0, 11)).toBe('Frage 1 von 11');
    expect(buildProgressLabel(10, 11)).toBe('Frage 11 von 11');
  });

  it('stops counting once every question is behind the visitor', () => {
    expect(buildProgressLabel(11, 11)).toBe('Alle Fragen durch');
  });
});

describe('buildAnsweredSummary', () => {
  it('reports how many answers the visitor gave', () => {
    expect(buildAnsweredSummary(9, 11)).toBe('Du hast 9 von 11 Fragen beantwortet.');
  });

  it('says so plainly when every question was skipped', () => {
    expect(buildAnsweredSummary(0, 11)).toBe('Du hast jede Frage übersprungen.');
  });
});

describe('the Kompass copy', () => {
  it('offers exactly the three stances a Gruppe can hold', () => {
    expect(kompassStanceChoices.map((choice) => choice.value)).toEqual(['yes', 'neutral', 'no']);
  });

  it('is never an -O-Mat', () => {
    expect(`${kompassKicker} ${kompassTitle}`.toLowerCase()).not.toContain('-mat');
  });

  it('promises as many questions as the payload asks', () => {
    expect(kompassIntro).toContain('Elf Fragen');
    expect(SEEDED_GROUP_MATCHER.questions).toHaveLength(11);
  });
});
