import { describe, expect, it } from 'vitest';
import { buildFallbackMailHref } from './apply-fallback';
import type { MembershipApplicationForm } from './schemas';
import { EMPTY_MEMBERSHIP_APPLICATION } from './schemas';

const CLUB_EMAIL = 'vorstand@furria.de';

const values: MembershipApplicationForm = {
  ...EMPTY_MEMBERSHIP_APPLICATION,
  firstName: 'Lena',
  lastName: 'Brandt',
  birthDate: '1994-03-14',
  street: 'Hauptstraße 12',
  postalCode: '99713',
  city: 'Großfurra',
  email: 'lena.brandt@example.de',
  consent: true,
};

const bodyOf = (href: string): string => {
  const query = href.slice(href.indexOf('?') + 1);
  const body = new URLSearchParams(query).get('body');

  return body ?? '';
};

const subjectOf = (href: string): string => {
  const query = href.slice(href.indexOf('?') + 1);

  return new URLSearchParams(query).get('subject') ?? '';
};

describe('buildFallbackMailHref', () => {
  it('addresses the club channel', () => {
    expect(buildFallbackMailHref(CLUB_EMAIL, values)).toContain(`mailto:${CLUB_EMAIL}?`);
  });

  it('names the applicant in the subject so nobody has to open the mail to sort it', () => {
    expect(subjectOf(buildFallbackMailHref(CLUB_EMAIL, values))).toBe(
      'Beitrittsantrag – Lena Brandt',
    );
  });

  it('carries every entered field so nothing has to be retyped', () => {
    const body = bodyOf(buildFallbackMailHref(CLUB_EMAIL, values));

    expect(body).toContain('Vorname: Lena');
    expect(body).toContain('Nachname: Brandt');
    expect(body).toContain('Straße und Hausnummer: Hauptstraße 12');
    expect(body).toContain('PLZ: 99713');
    expect(body).toContain('Ort: Großfurra');
    expect(body).toContain('E-Mail: lena.brandt@example.de');
  });

  it('spells the birth date out in German', () => {
    expect(bodyOf(buildFallbackMailHref(CLUB_EMAIL, values))).toContain(
      'Geburtsdatum: 14. März 1994',
    );
  });

  it('keeps an unusable birth date as it was typed', () => {
    const body = bodyOf(buildFallbackMailHref(CLUB_EMAIL, { ...values, birthDate: '' }));

    expect(body).not.toContain('Geburtsdatum:');
  });

  it('leaves out what was not filled in', () => {
    const body = bodyOf(buildFallbackMailHref(CLUB_EMAIL, values));

    expect(body).not.toContain('Telefon:');
  });

  it('records that consent was given, and only then', () => {
    expect(bodyOf(buildFallbackMailHref(CLUB_EMAIL, values))).toContain(
      'Satzung und Datenschutzhinweise gelesen: ja',
    );
    expect(bodyOf(buildFallbackMailHref(CLUB_EMAIL, { ...values, consent: false }))).not.toContain(
      'Satzung',
    );
  });

  it('never carries the honeypot', () => {
    expect(bodyOf(buildFallbackMailHref(CLUB_EMAIL, { ...values, honeypot: 'bot' }))).not.toContain(
      'bot',
    );
  });
});
