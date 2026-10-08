import { describe, expect, it } from 'vitest';
import { toAdoptionQueryEmail, toAdoptionSuggestion } from './adoption-suggestion';
import type { AdoptionCandidate } from './schemas';

describe('toAdoptionQueryEmail', () => {
  it.each<[string, string, boolean, string | null]>([
    ['a valid address while creating', 'anna@web.de', true, 'anna@web.de'],
    ['a padded, mixed-case address while creating', '  Anna@Web.DE ', true, 'anna@web.de'],
    ['an address still being typed', 'anna@web', true, null],
    ['a valid address while editing an existing person', 'anna@web.de', false, null],
  ])('decides for %s', (_case, typed, isCreating, expected) => {
    expect(toAdoptionQueryEmail(typed, isCreating)).toBe(expected);
  });
});

describe('toAdoptionSuggestion', () => {
  const anna: AdoptionCandidate = {
    personId: 7,
    firstName: 'Anna',
    lastName: 'Muster',
    hasAccount: true,
  };

  it.each<
    [
      string,
      string | null,
      string | null,
      AdoptionCandidate | null | undefined,
      AdoptionCandidate | null,
    ]
  >([
    ['a candidate for the typed address', 'anna@web.de', 'anna@web.de', anna, anna],
    ['no candidate for the typed address', 'anna@web.de', 'anna@web.de', null, null],
    ['an answer still loading', 'anna@web.de', 'anna@web.de', undefined, null],
    ['a candidate for an address typed before', 'anna@privat.de', 'anna@web.de', anna, null],
    ['no address to ask for', null, null, anna, null],
  ])('decides for %s', (_case, queryEmail, searchedEmail, candidate, expected) => {
    expect(toAdoptionSuggestion({ queryEmail, searchedEmail, candidate })).toEqual(expected);
  });
});
