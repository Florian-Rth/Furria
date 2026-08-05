import { describe, expect, it } from 'vitest';
import {
  APPLY_THANKS_STEPS,
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
  applyThanksHomeHref,
  applyThanksProgramHref,
  applyThanksText,
  buildApplyEyebrow,
  buildApplySummaryRows,
  buildApplyThanksHeadline,
} from './apply-content';
import type { DerivedMembership } from './membership-derivation';

const allThanksCopy = [
  applyThanksText,
  ...APPLY_THANKS_STEPS.map((step) => `${step.title} ${step.description}`),
].join(' ');

const WRITTEN_DATE =
  /\d{1,2}\.\s*(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/;

const NUMERIC_DATE = /\d{1,2}\.\d{1,2}\./;

const allApplyCopy = [
  allThanksCopy,
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

describe('the confirmation copy', () => {
  it('walks the applicant through Bestätigung, Aufnahme und Willkommen', () => {
    expect(APPLY_THANKS_STEPS.map((step) => step.title)).toEqual([
      'Bestätigung',
      'Aufnahme',
      'Willkommen',
    ]);
  });

  it('never calls the applicant a Mitglied yet', () => {
    expect(allThanksCopy).toContain('noch kein Mitglied');
    expect(allThanksCopy.toLowerCase()).not.toContain('du bist mitglied');
    expect(allThanksCopy.toLowerCase()).not.toContain('bist du mitglied');
  });

  it('names no date for the Sitzung, because there is none to name', () => {
    expect(allThanksCopy).not.toMatch(WRITTEN_DATE);
    expect(allThanksCopy).not.toMatch(NUMERIC_DATE);
  });

  it('keeps the Aufnahme open in both directions', () => {
    expect(APPLY_THANKS_STEPS[1]?.description).toContain('so oder so');
  });

  it('promises the Club-App only once the Aufnahme is through', () => {
    expect(APPLY_THANKS_STEPS[2]?.description).toContain('Sagen wir ja');
    expect(APPLY_THANKS_STEPS[2]?.description).toContain('Club-App');
  });

  it('says that there is nothing left to do and nothing to pay', () => {
    expect(applyThanksText).toContain('nichts tun');
    expect(applyThanksText).toContain('nichts zahlen');
  });

  it('leads out to the Programm and to the Startseite', () => {
    expect(applyThanksProgramHref).toBe('/program');
    expect(applyThanksHomeHref).toBe('/');
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
