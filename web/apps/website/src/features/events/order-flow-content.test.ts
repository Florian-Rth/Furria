import { describe, expect, it } from 'vitest';
import { EMBARGOED_MECHANICS, PLATZ_LANGUAGE } from '@/test/embargo';
import {
  orderBuyerFieldLabels,
  orderBuyerHeadline,
  orderBuyerNote,
  orderEntryCtaLabel,
  orderFlowActionLabels,
  orderFlowBackActionLabel,
  orderFlowDocumentTitlePrefix,
  orderFlowHeadlines,
  orderFlowMissingBuyerActionLabel,
  orderFlowMissingBuyerNotice,
  orderFlowNoticeSuffixes,
  orderFlowPlaceholderKicker,
  orderFlowPlaceholders,
  orderFlowStepLabels,
  orderWithdrawalNotice,
} from './order-flow-content';
import { LAST_ORDER_FLOW_STEP, ORDER_FLOW_STEPS } from './order-flow-steps';

const placeholderTexts = Object.values(orderFlowPlaceholders).flatMap((placeholder) => [
  placeholder.headline,
  placeholder.body,
]);

const stateTexts = [
  ...Object.values(orderFlowHeadlines),
  ...Object.values(orderFlowNoticeSuffixes),
];

const buyerTexts = [orderBuyerHeadline, orderBuyerNote, ...Object.values(orderBuyerFieldLabels)];

const paymentStepTexts = [
  ...Object.values(orderWithdrawalNotice),
  ...Object.values(orderFlowMissingBuyerNotice),
];

const flowConstants = [
  orderEntryCtaLabel,
  orderFlowBackActionLabel,
  orderFlowDocumentTitlePrefix,
  orderFlowMissingBuyerActionLabel,
  orderFlowPlaceholderKicker,
  ...ORDER_FLOW_STEPS.map((step) => orderFlowStepLabels[step]),
  ...ORDER_FLOW_STEPS.map((step) => orderFlowActionLabels[step]),
  ...buyerTexts,
  ...paymentStepTexts,
  ...placeholderTexts,
  ...stateTexts,
];

describe('orderFlowPlaceholderKicker', () => {
  it('names the placeholder panels a Platzhalter', () => {
    expect(orderFlowPlaceholderKicker).toMatch(/Platzhalter/i);
  });
});

describe('orderFlowPlaceholders', () => {
  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of placeholderTexts) {
      expect(text).not.toMatch(EMBARGOED_MECHANICS);
    }
  });

  it('gives every placeholder a headline and a body', () => {
    for (const placeholder of Object.values(orderFlowPlaceholders)) {
      expect(placeholder.headline.length).toBeGreaterThan(0);
      expect(placeholder.body.length).toBeGreaterThan(0);
    }
  });

  it('never promises the club still has to pick a payment method', () => {
    expect(orderFlowPlaceholders.payment.body).toMatch(/kein Geld/i);
    expect(orderFlowPlaceholders.payment.body).not.toMatch(/legt der Verein/i);
  });

  it('says the Karten line waits on the Kartenwahl instead of inventing a count', () => {
    expect(orderFlowPlaceholders.tickets.body).toMatch(/Kartenwahl/);
    expect(orderFlowPlaceholders.tickets.body).toMatch(/Summe/);
    expect(orderFlowPlaceholders.tickets.body).not.toMatch(/\d/);
  });
});

describe('orderWithdrawalNotice', () => {
  it('states the Widerruf exemption with its paragraph', () => {
    expect(orderWithdrawalNotice.body).toMatch(/§ 312g Abs\. 2 Nr\. 9 BGB/);
    expect(orderWithdrawalNotice.body).toMatch(/Widerrufsrecht/);
  });

  it('states the law as it stands instead of hedging it into a club plan', () => {
    expect(orderWithdrawalNotice.body).not.toMatch(
      /voraussichtlich|geplant|noch nicht|entscheidet der Verein/i,
    );
  });

  it('attaches no Kartenbörse promise to the exemption', () => {
    for (const text of Object.values(orderWithdrawalNotice)) {
      expect(text).not.toMatch(/Kartenbörse|Börse|umtauschen|zurückgeben/i);
    }
  });

  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of Object.values(orderWithdrawalNotice)) {
      expect(text).not.toMatch(EMBARGOED_MECHANICS);
      expect(text).not.toMatch(PLATZ_LANGUAGE);
    }
  });
});

describe('orderFlowMissingBuyerNotice', () => {
  it('names what is missing and where it belongs', () => {
    expect(orderFlowMissingBuyerNotice.body).toMatch(/Namen/);
    expect(orderFlowMissingBuyerNotice.body).toMatch(/E-Mail-Adresse/);
    expect(orderFlowMissingBuyerActionLabel).toMatch(/Daten/);
  });

  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of Object.values(orderFlowMissingBuyerNotice)) {
      expect(text).not.toMatch(EMBARGOED_MECHANICS);
      expect(text).not.toMatch(PLATZ_LANGUAGE);
    }
  });
});

describe('order buyer copy', () => {
  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of buyerTexts) {
      expect(text).not.toMatch(EMBARGOED_MECHANICS);
    }
  });

  it('asks for the name and the address and says so', () => {
    expect(orderBuyerNote).toMatch(/Namen/);
    expect(orderBuyerNote).toMatch(/E-Mail-Adresse/);
    expect(Object.values(orderBuyerFieldLabels)).toEqual(['Vorname', 'Nachname', 'E-Mail-Adresse']);
  });

  it('offers no account the site cannot give out yet', () => {
    for (const text of buyerTexts) {
      expect(text).not.toMatch(/anmelden|Anmeldung|einloggen|Login|registrier|Konto|Passwort/i);
    }
  });

  it('promises no data it never asks for', () => {
    for (const text of buyerTexts) {
      expect(text).not.toMatch(/Telefon|Anschrift|Adresse zu Hause|Postleitzahl/i);
    }
  });
});

describe('order flow state copy', () => {
  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of stateTexts) {
      expect(text).not.toMatch(EMBARGOED_MECHANICS);
    }
  });

  it('gives every blocked state its own second sentence', () => {
    for (const suffix of Object.values(orderFlowNoticeSuffixes)) {
      expect(suffix.length).toBeGreaterThan(0);
    }
  });
});

describe('order flow copy', () => {
  it('sells Karten and never Platzwahl', () => {
    for (const text of flowConstants) {
      expect(text).not.toMatch(PLATZ_LANGUAGE);
    }
  });

  it('never pretends the last step moves money', () => {
    expect(orderFlowActionLabels[LAST_ORDER_FLOW_STEP]).not.toMatch(
      /kauf|kosten|zahl|verbindlich|geld/i,
    );
  });

  it('never wears the pay-obligation wording while payment is a placeholder', () => {
    for (const text of flowConstants) {
      expect(text).not.toMatch(/zahlungspflichtig/i);
    }
  });

  it('names no payment service the reader would have to trust on faith', () => {
    for (const text of flowConstants) {
      expect(text).not.toMatch(/Stripe|Klarna|giropay|Sofort|Zahlungsdienst|Zahlungsanbieter/i);
    }
  });
});
