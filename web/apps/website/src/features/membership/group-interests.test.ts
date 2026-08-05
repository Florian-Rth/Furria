import { describe, expect, it } from 'vitest';
import { SEEDED_GROUPS } from '@/lib/seed/groups';
import { selectGroupLabels, selectKnownGroupIds, toggleGroupInterest } from './group-interests';

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

describe('selectKnownGroupIds', () => {
  it('keeps the ids the roster answers to', () => {
    expect(selectKnownGroupIds(SEEDED_GROUPS, ['tanzgarde', 'organisation'])).toEqual([
      'tanzgarde',
      'organisation',
    ]);
  });

  it('drops an id no Gruppe answers to instead of passing it on', () => {
    expect(selectKnownGroupIds(SEEDED_GROUPS, ['tanzgarde', 'showtanz'])).toEqual(['tanzgarde']);
  });

  it('drops every id when none of them is a Gruppe', () => {
    expect(selectKnownGroupIds(SEEDED_GROUPS, ['showtanz', 'werkstatt'])).toEqual([]);
  });

  it('keeps the order the ids arrived in', () => {
    expect(selectKnownGroupIds(SEEDED_GROUPS, ['organisation', 'tanzgarde'])).toEqual([
      'organisation',
      'tanzgarde',
    ]);
  });

  it('drops everything while no roster is loaded', () => {
    expect(selectKnownGroupIds([], ['tanzgarde'])).toEqual([]);
  });

  it('never mutates the selection it was given', () => {
    const selected = ['tanzgarde', 'showtanz'];

    selectKnownGroupIds(SEEDED_GROUPS, selected);

    expect(selected).toEqual(['tanzgarde', 'showtanz']);
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
