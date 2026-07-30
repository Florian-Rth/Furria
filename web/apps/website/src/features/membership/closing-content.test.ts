import { describe, expect, it } from 'vitest';
import { joinClosingBandContent } from './closing-content';
import { joinApplyHref } from './join-content';

const allClosingCopy = [
  joinClosingBandContent.kicker,
  joinClosingBandContent.headline,
  joinClosingBandContent.lead,
  joinClosingBandContent.ctaLabel,
].join(' ');

describe('joinClosingBandContent', () => {
  it('points the last word on the page at the Antrag', () => {
    expect(joinClosingBandContent.ctaHref).toBe(joinApplyHref);
    expect(joinClosingBandContent.ctaLabel).toContain('Antrag');
  });

  it('repeats that nothing is charged and nothing is binding yet', () => {
    expect(joinClosingBandContent.lead).toContain('abgebucht');
    expect(joinClosingBandContent.lead).toContain('bindend');
  });

  it('never names a Vorstand', () => {
    expect(allClosingCopy.toLowerCase()).not.toContain('vorstand');
  });

  it('never calls the sender a Mitglied before the Aufnahme', () => {
    expect(allClosingCopy.toLowerCase()).not.toContain('willkommen im verein');
  });
});
