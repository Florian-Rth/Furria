import { describe, expect, it } from 'vitest';
import { IntakeFormSchema, IntakeNewSearchSchema } from './schemas';

describe('IntakeFormSchema', () => {
  it.each([
    [{ isMember: true, memberFrom: null, groupIds: [], label: '' }, ['memberFrom']],
    [{ isMember: false, memberFrom: '2026-11-19', groupIds: [], label: '' }, ['groupIds']],
    [{ isMember: false, memberFrom: null, groupIds: ['3'], label: '' }, []],
    [{ isMember: true, memberFrom: '2026-11-19', groupIds: [], label: '' }, []],
  ])('asks for at least one affiliation and a member date (%#)', (form, failingPaths) => {
    const result = IntakeFormSchema.safeParse(form);
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));

    expect(paths).toEqual(failingPaths);
  });

  it('trims the label', () => {
    const parsed = IntakeFormSchema.parse({
      isMember: true,
      memberFrom: '2026-11-19',
      groupIds: [],
      label: '  Mia ',
    });

    expect(parsed.label).toBe('Mia');
  });
});

describe('IntakeNewSearchSchema', () => {
  it.each([
    [4, 4],
    [-1, undefined],
    ['x', undefined],
  ])('keeps only a valid group %s', (group, expected) => {
    expect(IntakeNewSearchSchema.parse({ group }).group).toBe(expected);
  });
});
