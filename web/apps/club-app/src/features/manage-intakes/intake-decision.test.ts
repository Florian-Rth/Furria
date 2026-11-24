import { describe, expect, it } from 'vitest';
import { toIntakeDecision } from './intake-decision';

const TODAY = '2026-11-19';

describe('toIntakeDecision', () => {
  it('drops the member date when she does not become a member and blanks an empty label', () => {
    expect(
      toIntakeDecision({ isMember: false, memberFrom: TODAY, groupIds: ['4', '5'], label: '  ' }),
    ).toEqual({ memberFrom: null, groupIds: [4, 5], label: null });
  });
});
