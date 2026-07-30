import { describe, expect, it } from 'vitest';
import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import { buildFallbackMailHref } from './apply-fallback';
import type { MembershipApplicationForm } from './schemas';
import { EMPTY_MEMBERSHIP_APPLICATION } from './schemas';

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
    expect(buildFallbackMailHref(values, [])).toContain(`mailto:${CLUB_CONTACT_EMAIL}?`);
  });

  it('names the applicant in the subject so nobody has to open the mail to sort it', () => {
    expect(subjectOf(buildFallbackMailHref(values, []))).toBe('Beitrittsantrag – Lena Brandt');
  });

  it('carries every entered field so nothing has to be retyped', () => {
    const body = bodyOf(buildFallbackMailHref(values, []));

    expect(body).toContain('Vorname: Lena');
    expect(body).toContain('Nachname: Brandt');
    expect(body).toContain('Straße und Hausnummer: Hauptstraße 12');
    expect(body).toContain('PLZ: 99713');
    expect(body).toContain('Ort: Großfurra');
    expect(body).toContain('E-Mail: lena.brandt@example.de');
  });

  it('spells the Geburtsdatum out in German', () => {
    expect(bodyOf(buildFallbackMailHref(values, []))).toContain('Geburtsdatum: 14. März 1994');
  });

  it('keeps an unusable Geburtsdatum as it was typed', () => {
    const body = bodyOf(buildFallbackMailHref({ ...values, birthDate: '' }, []));

    expect(body).not.toContain('Geburtsdatum:');
  });

  it('leaves out what was not filled in', () => {
    const body = bodyOf(buildFallbackMailHref(values, []));

    expect(body).not.toContain('Telefon:');
    expect(body).not.toContain('Gruppen');
    expect(body).not.toContain('Vertretung');
  });

  it('lists the Gruppen by name, not by id', () => {
    const body = bodyOf(buildFallbackMailHref(values, ['Tanzgarde', 'Organisation']));

    expect(body).toContain('Gruppen-Interessen: Tanzgarde, Organisation');
  });

  it('carries the guardian when one was entered', () => {
    const minor = {
      ...values,
      birthDate: '2015-05-04',
      guardianName: 'Katrin Brandt',
      guardianPhone: '0170 7654321',
    };
    const body = bodyOf(buildFallbackMailHref(minor, []));

    expect(body).toContain('Name der gesetzlichen Vertretung: Katrin Brandt');
    expect(body).toContain('Telefon der gesetzlichen Vertretung: 0170 7654321');
    expect(body).not.toContain('E-Mail der gesetzlichen Vertretung:');
  });

  it('records that the Einwilligung was given, and only then', () => {
    expect(bodyOf(buildFallbackMailHref(values, []))).toContain(
      'Satzung und Datenschutzhinweise gelesen: ja',
    );
    expect(bodyOf(buildFallbackMailHref({ ...values, consent: false }, []))).not.toContain(
      'Satzung',
    );
  });

  it('never carries the honeypot', () => {
    expect(bodyOf(buildFallbackMailHref({ ...values, honeypot: 'bot' }, []))).not.toContain('bot');
  });
});
