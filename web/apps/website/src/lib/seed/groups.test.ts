import { describe, expect, it } from 'vitest';
import { GroupsSchema, SEEDED_GROUPS } from './groups';

const seededGroup = {
  id: 'tanzgarde',
  name: 'Tanzgarde',
  ageRange: { from: 12, to: null },
  isRecruiting: true,
  tagline: 'Tanzen in Uniform.',
};

const payload = [seededGroup];

describe('GroupsSchema', () => {
  it('parses a payload with an open upper age bound', () => {
    expect(GroupsSchema.parse(payload)).toEqual(payload);
  });

  it('parses a payload with a closed upper age bound', () => {
    const closed = [{ ...seededGroup, ageRange: { from: 6, to: 11 } }];

    expect(GroupsSchema.parse(closed)).toEqual(closed);
  });

  it('drops fields the future endpoint may add', () => {
    const extended = [{ ...seededGroup, trainingSlot: 'Dienstag' }];

    expect(GroupsSchema.parse(extended)).toEqual(payload);
  });

  it('rejects a missing recruiting flag, because the badge must never guess', () => {
    const withoutFlag = [
      {
        id: 'tanzgarde',
        name: 'Tanzgarde',
        ageRange: { from: 12, to: null },
        tagline: 'Tanzen in Uniform.',
      },
    ];

    expect(() => GroupsSchema.parse(withoutFlag)).toThrow();
  });

  it('rejects an omitted upper age bound, since open must be stated as null', () => {
    const withoutUpperBound = [{ ...seededGroup, ageRange: { from: 12 } }];

    expect(() => GroupsSchema.parse(withoutUpperBound)).toThrow();
  });

  it('rejects a fractional age', () => {
    const fractional = [{ ...seededGroup, ageRange: { from: 5.5, to: null } }];

    expect(() => GroupsSchema.parse(fractional)).toThrow();
  });

  it('rejects an empty id, name or result line', () => {
    expect(() => GroupsSchema.parse([{ ...seededGroup, id: '' }])).toThrow();
    expect(() => GroupsSchema.parse([{ ...seededGroup, name: '' }])).toThrow();
    expect(() => GroupsSchema.parse([{ ...seededGroup, tagline: '' }])).toThrow();
  });
});

describe('SEEDED_GROUPS', () => {
  it('seeds the six real Gruppen in roster order', () => {
    expect(SEEDED_GROUPS.map((group) => group.name)).toEqual([
      'Tanzgarde',
      'Männerballett',
      'Elferrat',
      'Büttenrede',
      'Kindergarde',
      'Organisation',
    ]);
  });

  it('never reintroduces the invented Gruppen of the mocks', () => {
    const names = SEEDED_GROUPS.map((group) => group.name);

    expect(names).not.toContain('Spielmannszug');
    expect(names).not.toContain('Showtanz');
    expect(names).not.toContain('Jugendgarde');
  });

  it('gives every Gruppe a unique kebab-case id, since the id is the content key', () => {
    const ids = SEEDED_GROUPS.map((group) => group.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it('keeps the Kindergarde age range at 6 to 11', () => {
    const kindergarde = SEEDED_GROUPS.find((group) => group.name === 'Kindergarde');

    expect(kindergarde?.ageRange).toEqual({ from: 6, to: 11 });
  });

  it('never ends an age range before it starts', () => {
    for (const group of SEEDED_GROUPS) {
      const upperBound = group.ageRange.to;
      if (upperBound !== null) {
        expect(upperBound).toBeGreaterThanOrEqual(group.ageRange.from);
      }
    }
  });

  it('covers every age from the youngest bound upwards, so no age band matches nothing', () => {
    const youngest = Math.min(...SEEDED_GROUPS.map((group) => group.ageRange.from));
    const oldestClosedBound = Math.max(...SEEDED_GROUPS.map((group) => group.ageRange.to ?? 0));

    for (let age = youngest; age <= oldestClosedBound + 1; age += 1) {
      const matching = SEEDED_GROUPS.filter(
        (group) =>
          age >= group.ageRange.from && (group.ageRange.to === null || age <= group.ageRange.to),
      );

      expect(matching.length).toBeGreaterThan(0);
    }
  });

  it('states a short result line for every Gruppe', () => {
    for (const group of SEEDED_GROUPS) {
      expect(group.tagline.length).toBeLessThanOrEqual(90);
    }
  });

  it('leaves at least one Gruppe recruiting and one not, so both states are real', () => {
    expect(SEEDED_GROUPS.some((group) => group.isRecruiting)).toBe(true);
    expect(SEEDED_GROUPS.some((group) => !group.isRecruiting)).toBe(true);
  });
});
