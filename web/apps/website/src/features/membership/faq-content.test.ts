import { describe, expect, it } from 'vitest';
import { SEEDED_GROUPS } from '@/lib/seed/groups';
import {
  buildFaqPanelId,
  buildFaqQuestionId,
  JOIN_FAQ,
  joinFaqIntro,
  joinFaqTitle,
} from './faq-content';

const answerOf = (id: string): string => JOIN_FAQ.find((entry) => entry.id === id)?.answer ?? '';

const allFaqCopy = [
  joinFaqTitle,
  joinFaqIntro,
  ...JOIN_FAQ.flatMap((entry) => [entry.question, entry.answer]),
].join(' ');

const INVENTED_GROUPS = ['Werkstatt', 'Wagenbau', 'Technik', 'Showtanz', 'Jugendgarde'];

describe('buildFaqQuestionId', () => {
  it('names the summary so the panel can point back at it', () => {
    expect(buildFaqQuestionId('cost')).toBe('join-faq-cost-question');
  });
});

describe('buildFaqPanelId', () => {
  it('names the panel the summary controls', () => {
    expect(buildFaqPanelId('cost')).toBe('join-faq-cost-panel');
  });
});

describe('JOIN_FAQ', () => {
  it('gives every entry an id of its own', () => {
    const ids = JOIN_FAQ.map((entry) => entry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('opens with the question the page is named after', () => {
    expect(JOIN_FAQ[0]?.question).toBe('Muss ich tanzen können?');
    expect(answerOf('dancing')).toMatch(/^Nein/);
  });

  it('answers whether a Gruppe is required with no', () => {
    expect(answerOf('group')).toMatch(/^Nein/);
    expect(answerOf('group')).toContain('keine');
  });

  it('names both Beitrag tiers and rules out an Aufnahmegebühr', () => {
    expect(answerOf('cost')).toContain('30 €');
    expect(answerOf('cost')).toContain('15 €');
    expect(answerOf('cost')).toContain('Keine Aufnahmegebühr');
  });

  it('lets a Session be paused instead of cancelled', () => {
    expect(answerOf('pause')).toMatch(/^Nein/);
    expect(answerOf('pause')).toContain('ruht');
    expect(answerOf('pause')).toContain('ohne neuen Antrag');
  });

  it('answers the Wohnort question without asking for one', () => {
    expect(answerOf('local')).toContain('Wohnort');
  });

  it('keeps every answer filled in', () => {
    for (const entry of JOIN_FAQ) {
      expect(entry.answer.length).toBeGreaterThan(0);
    }
  });
});

describe('the FAQ copy', () => {
  it('never names a Vorstand', () => {
    expect(allFaqCopy.toLowerCase()).not.toContain('vorstand');
  });

  it('never calls a paused Mitgliedschaft passiv', () => {
    expect(allFaqCopy.toLowerCase()).not.toContain('passiv');
  });

  it('never rests on a drop-in training', () => {
    expect(allFaqCopy.toLowerCase()).not.toContain('vorbeikommen');
    expect(allFaqCopy.toLowerCase()).not.toContain('ohne anmeldung');
    expect(allFaqCopy.toLowerCase()).not.toContain('turnschuhe');
  });

  it('never promises Kostüme', () => {
    expect(allFaqCopy.toLowerCase()).not.toContain('kostüm');
  });

  it('never names a Gruppe the club does not have', () => {
    for (const invented of INVENTED_GROUPS) {
      expect(allFaqCopy).not.toContain(invented);
    }
  });

  it('names only Gruppen from the roster', () => {
    const named = SEEDED_GROUPS.filter((group) => allFaqCopy.includes(group.name));

    expect(named.length).toBeGreaterThan(0);
  });
});
