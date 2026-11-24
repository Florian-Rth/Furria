import { describe, expect, it } from 'vitest';
import { IntakeFormSchema } from './schemas';

describe('IntakeFormSchema', () => {
  it.each([
    [{ isMember: true, memberFrom: null, groupIds: [], label: '' }, ['memberFrom']],
    [{ isMember: false, memberFrom: '2026-11-19', groupIds: [], label: '' }, ['groupIds']],
  ])('asks for at least one affiliation and a member date (%#)', (form, failingPaths) => {
    const result = IntakeFormSchema.safeParse(form);
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path.join('.'));

    expect(paths).toEqual(failingPaths);
  });
});
