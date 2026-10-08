import { describe, expect, it } from 'vitest';
import { buildTicketRequestFallbackHref } from './ticket-request-fallback';

const event = { title: '1. Prunksitzung', startsAt: '2027-01-23T19:11' };

const queryOf = (href: string): URLSearchParams =>
  new URLSearchParams(href.slice(href.indexOf('?') + 1));

describe('buildTicketRequestFallbackHref', () => {
  it('writes the request into a mail to the club, leaving out what is empty', () => {
    const href = buildTicketRequestFallbackHref('vorstand@furria.de', event, {
      ticketCount: 4,
      name: 'Lena Brandt',
      phone: '0170 1234567',
      email: 'lena@example.de',
      message: '',
      consent: true,
      honeypot: '',
    });

    expect(href.startsWith('mailto:vorstand@furria.de?')).toBe(true);
    expect(queryOf(href).get('subject')).toBe('Kartenanfrage – 1. Prunksitzung – 4 Karten');
    expect(queryOf(href).get('body')?.split('\n').slice(2)).toEqual([
      'Veranstaltung: 1. Prunksitzung',
      'Termin: 23.01.2027, 19:11 Uhr',
      'Karten: 4',
      'Name: Lena Brandt',
      'Telefon: 0170 1234567',
      'E-Mail: lena@example.de',
      'Datenschutzhinweise gelesen: ja',
    ]);
  });
});
