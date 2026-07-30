import { describe, expect, it } from 'vitest';
import {
  applyAddressNote,
  applyConsentLeadGuardian,
  applyConsentLeadSelf,
  applyConsentNote,
  applyConsentTail,
  applyContactNote,
  applyFallbackLead,
  applyFieldLabels,
  applyGuardianNote,
  applyInterestsNote,
  applyLead,
  applyNothingDueValue,
  applyPrivacyHref,
  applySatzungHref,
  applySubmitNote,
  applySummaryNote,
  applyThanksText,
  buildApplyEyebrow,
  buildApplySummaryRows,
  buildApplyThanksHeadline,
} from './apply-content';
import type { DerivedMembership } from './membership-derivation';

const allApplyCopy = [
  applyLead,
  applyAddressNote,
  applyContactNote,
  applyInterestsNote,
  applyGuardianNote,
  applyConsentLeadSelf,
  applyConsentLeadGuardian,
  applyConsentTail,
  applyConsentNote,
  applySummaryNote,
  applySubmitNote,
  applyFallbackLead,
  applyThanksText,
  ...Object.values(applyFieldLabels),
].join(' ');

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

describe('buildApplyEyebrow', () => {
  it('stamps the Antrag with the running Session', () => {
    expect(buildApplyEyebrow('2026/27')).toBe('BEITRITTSANTRAG · SESSION 2026/27');
  });
});

describe('buildApplySummaryRows', () => {
  it('echoes the derived Mitgliedschaft and Beitrag of an adult', () => {
    expect(buildApplySummaryRows(active)).toEqual([
      { label: 'MITGLIEDSCHAFT', value: 'Aktiv' },
      { label: 'BEITRAG', value: '30 € im Jahr' },
      { label: 'JETZT FÄLLIG', value: '0 €' },
    ]);
  });

  it('echoes Jugend and the youth Beitrag for someone under 18', () => {
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

  it('always says that nothing is due now', () => {
    for (const derived of [active, youth, null]) {
      expect(buildApplySummaryRows(derived)[2]).toEqual({
        label: 'JETZT FÄLLIG',
        value: applyNothingDueValue,
      });
    }
  });

  it('echoes derived values only and never a typed field', () => {
    const labels = buildApplySummaryRows(active).map((row) => row.label);

    expect(labels).not.toContain('VORNAME');
    expect(labels).not.toContain('E-MAIL');
    expect(labels).toHaveLength(3);
  });
});

describe('buildApplyThanksHeadline', () => {
  it('thanks the applicant by first name and never welcomes a Mitglied', () => {
    expect(buildApplyThanksHeadline('LENA')).toBe('DANKE, LENA.');
    expect(buildApplyThanksHeadline('LENA').toLowerCase()).not.toContain('willkommen');
  });
});

describe('the Antrag copy', () => {
  it('links the Satzung and the Datenschutzhinweise, and nothing else', () => {
    expect(applySatzungHref).toBe('/satzung');
    expect(applyPrivacyHref).toBe('/privacy');
  });

  it('never names a Vorstand', () => {
    expect(allApplyCopy.toLowerCase()).not.toContain('vorstand');
  });

  it('never calls a Mitgliedschaftsart passiv', () => {
    expect(allApplyCopy.toLowerCase()).not.toContain('passiv');
  });

  it('never asks for a photo consent', () => {
    expect(allApplyCopy.toLowerCase()).not.toContain('foto');
    expect(allApplyCopy.toLowerCase()).not.toContain('instagram');
  });

  it('never promises an SMS or a second confirmation channel', () => {
    expect(allApplyCopy.toLowerCase()).not.toContain('sms');
    expect(allApplyCopy.toLowerCase()).not.toContain('bestätigungs-link');
  });

  it('says that nothing is charged yet', () => {
    expect(applyConsentNote).toContain('nichts abgebucht');
  });

  it('frames the Gruppen as an interest and no Gruppe as normal', () => {
    expect(applyInterestsNote).toContain('keine Zusage');
    expect(applyInterestsNote).toContain('normal');
  });

  it('explains that the Mitgliedschaft is derived, not chosen', () => {
    expect(applySummaryNote).toContain('Geburtsdatum');
    expect(applySummaryNote).toContain('Jugend');
    expect(applySummaryNote).toContain('Aktiv');
  });

  it('keeps the applicant an applicant', () => {
    expect(applySubmitNote).toContain('sobald wir dir das bestätigen');
  });

  it('offers a human fallback that needs no retyping', () => {
    expect(applyFallbackLead).toContain('Mail');
    expect(applyFallbackLead).toContain('eingetragen');
  });
});
