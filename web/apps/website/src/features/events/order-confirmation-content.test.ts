import { describe, expect, it } from 'vitest';
import { CLUB_CONTACT_EMAIL } from '@/lib/club';
import { EMBARGOED_MECHANICS, PLATZ_LANGUAGE } from '@/test/embargo';
import {
  orderConfirmationDocumentTitle,
  orderCrossSellContent,
  orderDemoNotice,
  orderErrorContent,
  orderErrorMailHref,
  orderErrorMailLabel,
  orderLoadingLabel,
  orderStateHeroes,
  orderSummaryKicker,
  orderTicketCountLabels,
} from './order-confirmation-content';

const heroTexts = Object.values(orderStateHeroes).flatMap((hero) => [
  hero.kicker,
  hero.headline,
  hero.body,
]);

const confirmationConstants = [
  orderConfirmationDocumentTitle,
  orderLoadingLabel,
  orderSummaryKicker,
  ...Object.values(orderDemoNotice),
  ...Object.values(orderTicketCountLabels),
  ...Object.values(orderCrossSellContent),
  ...Object.values(orderErrorContent),
  ...heroTexts,
];

describe('orderStateHeroes', () => {
  it('ships both payment faces in final form', () => {
    expect(Object.keys(orderStateHeroes)).toEqual(['paid', 'processing']);
    for (const hero of Object.values(orderStateHeroes)) {
      expect(hero.kicker.length).toBeGreaterThan(0);
      expect(hero.headline.length).toBeGreaterThan(0);
      expect(hero.body.length).toBeGreaterThan(0);
    }
  });

  it('tells the two faces apart', () => {
    expect(orderStateHeroes.paid.kicker).not.toBe(orderStateHeroes.processing.kicker);
    expect(orderStateHeroes.paid.headline).not.toBe(orderStateHeroes.processing.headline);
    expect(orderStateHeroes.paid.body).not.toBe(orderStateHeroes.processing.body);
  });

  it('says the mail is on its way without promising what is inside it', () => {
    for (const hero of Object.values(orderStateHeroes)) {
      expect(hero.body).toMatch(/Mail/);
    }
  });

  it('never says the money is in while the payment is still on its way', () => {
    expect(orderStateHeroes.processing.body).not.toMatch(/bezahlt|Zahlung ist da|eingegangen/i);
  });
});

describe('order confirmation copy', () => {
  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of confirmationConstants) {
      expect(text).not.toMatch(EMBARGOED_MECHANICS);
    }
  });

  it('sells Karten and never Platzwahl', () => {
    for (const text of confirmationConstants) {
      expect(text).not.toMatch(PLATZ_LANGUAGE);
    }
  });

  it('never wears the pay-obligation wording while payment is a placeholder', () => {
    for (const text of confirmationConstants) {
      expect(text).not.toMatch(/zahlungspflichtig/i);
    }
  });

  it('never invites the reader to quote a code', () => {
    for (const text of confirmationConstants) {
      expect(text).not.toMatch(/Bestellnummer|Bestellcode|Buchungsnummer|Ticketnummer/i);
    }
  });

  it('never promises anything about getting in on the evening', () => {
    for (const text of confirmationConstants) {
      expect(text).not.toMatch(/Einlasskontrolle|Eingang|vorzeigen|am Einlass|Einlassband/i);
    }
  });
});

describe('order error copy', () => {
  it('offers a human as the fallback', () => {
    expect(orderErrorMailLabel).toBe(CLUB_CONTACT_EMAIL);
    expect(orderErrorMailHref).toBe(`mailto:${CLUB_CONTACT_EMAIL}`);
    expect(orderErrorContent.body).toMatch(/Mensch/);
  });

  it('blames the link and never the reader', () => {
    expect(orderErrorContent.body).toMatch(/Link/);
    expect(orderErrorContent.body).not.toMatch(/falsch eingegeben|dein Fehler/i);
  });
});

describe('orderDemoNotice', () => {
  it('says out loud that the example Bestellung is invented', () => {
    expect(orderDemoNotice.title).toMatch(/Beispiel/i);
    expect(orderDemoNotice.body).toMatch(/erfunden/i);
  });

  it('denies that any money moved for it', () => {
    expect(orderDemoNotice.body).toMatch(/kein Geld/i);
  });
});
