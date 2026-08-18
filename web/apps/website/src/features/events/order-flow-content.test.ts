import { describe, expect, it } from 'vitest';
import {
  orderEntryCtaLabel,
  orderFlowActionLabels,
  orderFlowBackActionLabel,
  orderFlowDocumentTitlePrefix,
  orderFlowHeadlines,
  orderFlowNoticeSuffixes,
  orderFlowPlaceholderKicker,
  orderFlowStepLabels,
  orderFlowStepPlaceholders,
} from './order-flow-content';
import { LAST_ORDER_FLOW_STEP, ORDER_FLOW_STEPS } from './order-flow-steps';

const embargoedMechanics =
  /Saalplan|Sitzplan|\bSitzplätze?\b|\bPlätze\b|Reihe|reserviert|Warteliste|Stehplätz|Gruppenbestellung|Rollstuhl|PayPal|Kreditkarte|Lastschrift|Abendkasse|\blive\b/i;

const platzLanguage = /Platzwahl|Platz wählen/i;

const placeholderTexts = ORDER_FLOW_STEPS.flatMap((step) => [
  orderFlowStepPlaceholders[step].headline,
  orderFlowStepPlaceholders[step].body,
]);

const stateTexts = [
  ...Object.values(orderFlowHeadlines),
  ...Object.values(orderFlowNoticeSuffixes),
];

const flowConstants = [
  orderEntryCtaLabel,
  orderFlowBackActionLabel,
  orderFlowDocumentTitlePrefix,
  orderFlowPlaceholderKicker,
  ...ORDER_FLOW_STEPS.map((step) => orderFlowStepLabels[step]),
  ...ORDER_FLOW_STEPS.map((step) => orderFlowActionLabels[step]),
  ...placeholderTexts,
  ...stateTexts,
];

describe('orderFlowPlaceholderKicker', () => {
  it('names the placeholder panels a Platzhalter', () => {
    expect(orderFlowPlaceholderKicker).toMatch(/Platzhalter/i);
  });
});

describe('orderFlowStepPlaceholders', () => {
  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of placeholderTexts) {
      expect(text).not.toMatch(embargoedMechanics);
    }
  });

  it('covers every step of the flow', () => {
    for (const step of ORDER_FLOW_STEPS) {
      expect(orderFlowStepPlaceholders[step].headline.length).toBeGreaterThan(0);
      expect(orderFlowStepPlaceholders[step].body.length).toBeGreaterThan(0);
    }
  });
});

describe('order flow state copy', () => {
  it('claims none of the mechanics the club has not decided yet', () => {
    for (const text of stateTexts) {
      expect(text).not.toMatch(embargoedMechanics);
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
      expect(text).not.toMatch(platzLanguage);
    }
  });

  it('never pretends the last step moves money', () => {
    expect(orderFlowActionLabels[LAST_ORDER_FLOW_STEP]).not.toMatch(
      /kaufen|kostenpflichtig|bezahlt|gekauft/i,
    );
  });
});
