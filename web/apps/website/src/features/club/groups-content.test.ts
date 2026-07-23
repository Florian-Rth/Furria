import { describe, expect, it } from 'vitest';
import { GROUPS } from './groups-content';

describe('GROUPS', () => {
  it('seeds the P2-locked Gruppen names', () => {
    expect(GROUPS.map((group) => group.title)).toEqual(
      expect.arrayContaining(['Tanzgarde', 'Männerballett', 'Elferrat', 'Büttenrede']),
    );
  });

  it('never reintroduces the mock Spielmannszug error', () => {
    expect(GROUPS.map((group) => group.title)).not.toContain('Spielmannszug');
  });

  it('gives every Gruppe the public-facing fields the grid and modal will need', () => {
    for (const group of GROUPS) {
      expect(group.title).not.toBe('');
      expect(group.blurb).not.toBe('');
      expect(group.memberMeta).not.toBe('');
      expect(group.fullText).not.toBe('');
      expect(group.lead).not.toBe('');
      expect(group.schedule).not.toBe('');
    }
  });
});
