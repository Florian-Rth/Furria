import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import { PEOPLE, peopleChapter, resolvePersonTint } from './people-content';

describe('peopleChapter', () => {
  it('is the fifth numbered chapter putting faces to the club', () => {
    expect(peopleChapter.numeral).toBe('05');
    expect(peopleChapter.title).toBe('MENSCHEN, DIE FURRIA SIND');
  });

  it('never frames the section as a Vorstand', () => {
    expect(JSON.stringify(peopleChapter)).not.toMatch(/Vorstand/i);
  });
});

describe('PEOPLE', () => {
  it('seeds the placeholder faces keyed on their Amt', () => {
    expect(PEOPLE.map((person) => person.amt)).toEqual([
      'Präsident',
      'Präsidentin',
      'Kinderpräsidentin',
      'Geschäftsführer',
      'Getränkewart',
      'Trainerin',
    ]);
  });

  it('carries the placeholder names from the handoff', () => {
    expect(PEOPLE.map((person) => person.name)).toEqual([
      'Franz-Josef Besen',
      'Marlies Furrmann',
      'Lena Kehr',
      'Bernd Groß',
      'Uwe Fass',
      'Sabine Wirbel',
    ]);
  });

  it('gives every person an Amt and a name', () => {
    for (const person of PEOPLE) {
      expect(person.amt).not.toBe('');
      expect(person.name).not.toBe('');
    }
  });

  it('never keys a person on the forbidden Vorstand framing', () => {
    expect(JSON.stringify(PEOPLE)).not.toMatch(/Vorstand/i);
  });
});

describe('resolvePersonTint', () => {
  const theme = createTheme();

  it('cycles red, gold then ink by position', () => {
    expect(resolvePersonTint(theme, 0)).toBe(theme.palette.primary.main);
    expect(resolvePersonTint(theme, 1)).toBe(theme.palette.warning.main);
    expect(resolvePersonTint(theme, 2)).toBe(theme.palette.text.primary);
  });

  it('wraps so it scales to any number of portraits', () => {
    expect(resolvePersonTint(theme, 3)).toBe(resolvePersonTint(theme, 0));
    expect(resolvePersonTint(theme, PEOPLE.length)).toBe(
      resolvePersonTint(theme, PEOPLE.length % 3),
    );
  });
});
