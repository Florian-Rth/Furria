import { describe, expect, it } from 'vitest';
import { recruitBandContent } from './recruit-content';

describe('recruitBandContent', () => {
  it('states the real Beitrag tiers in the kicker verbatim', () => {
    expect(recruitBandContent.kicker).toBe('MITMACHEN · AB 30 € IM JAHR · KINDER 15 €');
  });

  it('names the yearly and children Beitrag amounts', () => {
    expect(recruitBandContent.kicker).toMatch(/30 €/);
    expect(recruitBandContent.kicker).toMatch(/KINDER 15 €/);
  });

  it('closes the page on the join-focused headline', () => {
    expect(recruitBandContent.headline).toBe('WERDE TEIL VON FURRIA');
  });

  it('carries a short inviting intro paragraph', () => {
    expect(recruitBandContent.intro).not.toBe('');
  });

  it('points the primary button at the join funnel', () => {
    expect(recruitBandContent.primaryLabel).toBe('Mitglied werden →');
    expect(recruitBandContent.primaryTo).toBe('/join');
  });

  it('points the secondary button at the season programme', () => {
    expect(recruitBandContent.secondaryLabel).toBe('Programm ansehen');
    expect(recruitBandContent.secondaryTo).toBe('/program');
  });
});
