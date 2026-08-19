import { describe, expect, it } from 'vitest';
import { EMBARGOED_MECHANICS, PLATZ_LANGUAGE } from '@/test/embargo';
import { orderSummaryLabels, orderSummaryTitle } from './order-summary-content';

const summaryTexts = [orderSummaryTitle, ...Object.values(orderSummaryLabels)];

describe('order summary copy', () => {
  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of summaryTexts) {
      expect(text).not.toMatch(EMBARGOED_MECHANICS);
      expect(text).not.toMatch(PLATZ_LANGUAGE);
    }
  });

  it('labels all seven lines the Bestellübersicht can show, out of one home', () => {
    expect(Object.values(orderSummaryLabels)).toEqual([
      'Abend',
      'Termin',
      'Ort',
      'Karten',
      'Summe',
      'Bestellt von',
      'E-Mail',
    ]);
  });

  it('names the summary after the Bestellung, not after an internal term', () => {
    expect(orderSummaryTitle).toBe('DEINE BESTELLUNG');
  });
});
