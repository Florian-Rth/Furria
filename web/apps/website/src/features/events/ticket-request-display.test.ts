import { describe, expect, it } from 'vitest';
import { formatEuros } from '@/lib/money';
import {
  buildTicketRequestSummaryRows,
  buildTicketRequestThanksText,
} from './ticket-request-display';

const event = {
  title: '1. Prunksitzung',
  startsAt: '2027-01-23T19:11',
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
};

describe('buildTicketRequestSummaryRows', () => {
  it('prices the requested tickets when the evening has a price', () => {
    const rows = buildTicketRequestSummaryRows({ ...event, priceCents: 1400 }, 4);

    expect(rows.map((row) => row.label)).toEqual([
      'ABEND',
      'BEGINN',
      'ORT',
      'KARTEN',
      'PREIS',
      'ZUSAMMEN',
      'JETZT FÄLLIG',
    ]);
    expect(rows.find((row) => row.label === 'ZUSAMMEN')?.value).toBe(formatEuros(5600));
  });

  it.each([
    [1, '1 Karte'],
    [3, '3 Karten'],
  ])('counts %i tickets as %s and names no price the evening lacks', (ticketCount, label) => {
    const rows = buildTicketRequestSummaryRows({ ...event, priceCents: null }, ticketCount);

    expect(rows.find((row) => row.label === 'KARTEN')?.value).toBe(label);
    expect(rows.some((row) => row.label === 'ZUSAMMEN')).toBe(false);
  });
});

describe('buildTicketRequestThanksText', () => {
  it('names the evening, the tickets and the address the receipt went to', () => {
    expect(buildTicketRequestThanksText(event, 4, 'lena@example.de')).toBe(
      'Deine Anfrage für 4 Karten für „1. Prunksitzung“ am 23. Januar 2027 ist beim Verein. Eine Bestätigung ist an lena@example.de unterwegs. Wir melden uns bei dir — per Telefon oder Mail.',
    );
  });
});
