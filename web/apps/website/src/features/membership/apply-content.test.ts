import { describe, expect, it } from 'vitest';
import { applyNothingDueValue, buildApplySummaryRows } from './apply-content';
import type { DerivedMembership } from './membership-derivation';

const active: DerivedMembership = {
  age: 32,
  typeId: 'active',
  feeEuros: 30,
  requiresGuardian: false,
};

const youth: DerivedMembership = {
  age: 14,
  typeId: 'youth',
  feeEuros: 15,
  requiresGuardian: true,
};

describe('buildApplySummaryRows', () => {
  it('echoes the derived Mitgliedschaft and Beitrag', () => {
    expect(buildApplySummaryRows(active).slice(0, 2)).toEqual([
      { label: 'MITGLIEDSCHAFT', value: 'Aktiv' },
      { label: 'BEITRAG', value: '30 € im Jahr' },
    ]);
    expect(buildApplySummaryRows(youth).slice(0, 2)).toEqual([
      { label: 'MITGLIEDSCHAFT', value: 'Jugend' },
      { label: 'BEITRAG', value: '15 € im Jahr' },
    ]);
  });

  it('waits for the Geburtsdatum instead of guessing', () => {
    const rows = buildApplySummaryRows(null);

    expect(rows[0]?.value).toBe('steht mit dem Geburtsdatum');
    expect(rows[1]?.value).toBe('steht mit dem Geburtsdatum');
  });

  it('says that nothing is due now, whatever was derived', () => {
    for (const derived of [active, youth, null]) {
      expect(buildApplySummaryRows(derived)[2]).toEqual({
        label: 'JETZT FÄLLIG',
        value: applyNothingDueValue,
      });
    }
  });
});
