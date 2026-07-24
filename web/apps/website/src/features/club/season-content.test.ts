import { describe, expect, it } from 'vitest';
import { SEASON_STEPS, seasonChapter, seasonIntro } from './season-content';

describe('seasonChapter', () => {
  it('is the third numbered chapter reinforcing the Session term', () => {
    expect(seasonChapter.numeral).toBe('03');
    expect(seasonChapter.title).toBe('EINE SESSION');
  });
});

describe('seasonIntro', () => {
  it('frames the Session as opening on 11.11. and running to Aschermittwoch', () => {
    expect(seasonIntro).toMatch(/11\.11\./);
    expect(seasonIntro).toMatch(/Aschermittwoch/);
  });
});

describe('SEASON_STEPS', () => {
  it('describes the season as five ordered steps', () => {
    expect(SEASON_STEPS).toHaveLength(5);
  });

  it('runs from the 11.11. Eröffnung to the Aschermittwoch Ausklang', () => {
    expect(SEASON_STEPS[0]).toMatchObject({ tag: '11.11.', title: 'Die Eröffnung' });
    expect(SEASON_STEPS.at(-1)).toMatchObject({
      tag: 'Aschermittwoch',
      title: 'Der Ausklang',
    });
  });

  it('carries the real carnival milestones in order', () => {
    expect(SEASON_STEPS.map((step) => step.tag)).toEqual([
      '11.11.',
      'Advent',
      'Februar',
      'Rosenmontag',
      'Aschermittwoch',
    ]);
  });

  it('gives every step a tag, title and description', () => {
    for (const step of SEASON_STEPS) {
      expect(step.tag).not.toBe('');
      expect(step.title).not.toBe('');
      expect(step.description).not.toBe('');
    }
  });
});
