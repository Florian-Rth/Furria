import { describe, expect, it } from 'vitest';
import { buildChildFaqAnswer } from './faq-content';

describe('buildChildFaqAnswer', () => {
  it.each([12, 14, 16])('names the age of consent %i the club has set', (ageOfConsent) => {
    expect(buildChildFaqAnswer(ageOfConsent)).toMatch(new RegExp(`\\b${ageOfConsent}\\b`));
  });

  it('names no age of consent while the club has not said it yet', () => {
    expect(buildChildFaqAnswer(null)).not.toMatch(/\b1[2-7]\b/);
  });
});
