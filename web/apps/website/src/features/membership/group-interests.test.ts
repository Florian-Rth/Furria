import { describe, expect, it } from 'vitest';
import { SEEDED_GROUPS } from '@/lib/seed/groups';
import { selectGroupLabels, toggleGroupInterest } from './group-interests';

describe('toggleGroupInterest', () => {
  it('adds a Gruppe that was not picked yet', () => {
    expect(toggleGroupInterest([], 'tanzgarde')).toEqual(['tanzgarde']);
  });

  it('keeps several Gruppen, because the interest is many-to-many', () => {
    expect(toggleGroupInterest(['tanzgarde'], 'organisation')).toEqual([
      'tanzgarde',
      'organisation',
    ]);
  });

  it('drops a Gruppe that was picked before', () => {
    expect(toggleGroupInterest(['tanzgarde', 'organisation'], 'tanzgarde')).toEqual([
      'organisation',
    ]);
  });

  it('treats an empty answer as a normal answer', () => {
    expect(toggleGroupInterest(['tanzgarde'], 'tanzgarde')).toEqual([]);
  });

  it('never mutates the answer it was given', () => {
    const selected = ['tanzgarde'];

    toggleGroupInterest(selected, 'organisation');

    expect(selected).toEqual(['tanzgarde']);
  });
});

describe('selectGroupLabels', () => {
  it('names the picked Gruppen instead of listing ids', () => {
    expect(selectGroupLabels(SEEDED_GROUPS, ['kindergarde'])).toEqual(['Kindergarde']);
  });

  it('keeps the roster order, not the click order', () => {
    expect(selectGroupLabels(SEEDED_GROUPS, ['organisation', 'tanzgarde'])).toEqual([
      'Tanzgarde',
      'Organisation',
    ]);
  });

  it('ignores an id no Gruppe answers to', () => {
    expect(selectGroupLabels(SEEDED_GROUPS, ['showtanz'])).toEqual([]);
  });

  it('names nothing when nothing was picked', () => {
    expect(selectGroupLabels(SEEDED_GROUPS, [])).toEqual([]);
  });
});
