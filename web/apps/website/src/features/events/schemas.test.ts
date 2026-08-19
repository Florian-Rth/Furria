import { describe, expect, it } from 'vitest';
import { EMBARGOED_MECHANICS, PLATZ_LANGUAGE } from '@/test/embargo';
import type { OrderBuyerForm } from './schemas';
import {
  BUYER_EMAIL_MAX_LENGTH,
  BUYER_NAME_MAX_LENGTH,
  EMPTY_ORDER_BUYER,
  OrderBuyerFormSchema,
  OrderFlowSearchSchema,
} from './schemas';

type UrlSearch = Record<string, string | string[] | null>;

const parseStep = (search: UrlSearch): number | undefined =>
  OrderFlowSearchSchema.parse(search).step;

describe('OrderFlowSearchSchema', () => {
  it('reads a step of the flow from the URL string', () => {
    expect(parseStep({ step: '2' })).toBe(2);
  });

  it('leaves the param out when it is absent', () => {
    expect(parseStep({})).toBeUndefined();
  });

  it('normalises garbage to no param instead of throwing', () => {
    expect(parseStep({ step: 'zwölf' })).toBeUndefined();
    expect(parseStep({ step: '' })).toBeUndefined();
    expect(parseStep({ step: '3.5' })).toBeUndefined();
    expect(parseStep({ step: '-2' })).toBeUndefined();
    expect(parseStep({ step: '0' })).toBeUndefined();
    expect(parseStep({ step: '9' })).toBeUndefined();
    expect(parseStep({ step: ['1', '2'] })).toBeUndefined();
    expect(parseStep({ step: null })).toBeUndefined();
  });

  it('ignores unrelated params', () => {
    expect(parseStep({ schritt: '2' })).toBeUndefined();
  });
});

const buyer: OrderBuyerForm = {
  firstName: 'Lena',
  lastName: 'Brandt',
  email: 'lena.brandt@example.de',
};

const allMessagesFor = (values: OrderBuyerForm): string[] => {
  const result = OrderBuyerFormSchema.safeParse(values);

  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

const messagesFor = (values: OrderBuyerForm, field: keyof OrderBuyerForm): string[] => {
  const result = OrderBuyerFormSchema.safeParse(values);

  if (result.success) {
    return [];
  }

  return result.error.issues
    .filter((issue) => issue.path.join('.') === field)
    .map((issue) => issue.message);
};

describe('OrderBuyerFormSchema', () => {
  it('accepts a name and an address to send the Bestellung to', () => {
    expect(OrderBuyerFormSchema.safeParse(buyer).success).toBe(true);
  });

  it('asks for the two names it needs when the form is still empty', () => {
    expect(messagesFor(EMPTY_ORDER_BUYER, 'firstName')).toEqual([
      'Bitte trag deinen Vornamen ein.',
    ]);
    expect(messagesFor(EMPTY_ORDER_BUYER, 'lastName')).toEqual([
      'Bitte trag deinen Nachnamen ein.',
    ]);
  });

  it('reads whitespace as no name at all', () => {
    expect(messagesFor({ ...buyer, firstName: '   ' }, 'firstName')).toEqual([
      'Bitte trag deinen Vornamen ein.',
    ]);
  });

  it('trims what was typed', () => {
    const result = OrderBuyerFormSchema.safeParse({
      firstName: '  Lena  ',
      lastName: ' Brandt ',
      email: ' lena.brandt@example.de ',
    });

    expect(result.success && result.data).toEqual(buyer);
  });

  it('turns down anything that cannot receive a Bestellung', () => {
    for (const email of ['', 'keine-mail', 'lena@', '@example.de', 'lena brandt@example.de']) {
      expect(messagesFor({ ...buyer, email }, 'email')).toEqual([
        'Bitte trag eine E-Mail-Adresse ein, an die deine Bestellung gehen kann.',
      ]);
    }
  });

  it('stops at the number of characters it can store', () => {
    expect(
      messagesFor({ ...buyer, firstName: 'L'.repeat(BUYER_NAME_MAX_LENGTH + 1) }, 'firstName'),
    ).toEqual(['Das sind mehr Zeichen, als wir speichern können.']);
    expect(
      messagesFor({ ...buyer, lastName: 'B'.repeat(BUYER_NAME_MAX_LENGTH + 1) }, 'lastName'),
    ).toEqual(['Das sind mehr Zeichen, als wir speichern können.']);
    expect(
      messagesFor({ ...buyer, email: `${'l'.repeat(BUYER_EMAIL_MAX_LENGTH)}@example.de` }, 'email'),
    ).toEqual(['Das sind mehr Zeichen, als eine E-Mail-Adresse haben darf.']);
  });

  it('accepts a name that just fits', () => {
    expect(
      OrderBuyerFormSchema.safeParse({ ...buyer, firstName: 'L'.repeat(BUYER_NAME_MAX_LENGTH) })
        .success,
    ).toBe(true);
  });

  it('asks for nothing beyond the name and the address', () => {
    expect(Object.keys(EMPTY_ORDER_BUYER)).toEqual(['firstName', 'lastName', 'email']);
  });

  it('claims none of the mechanics the club has not decided yet when it turns something down', () => {
    const messages = [
      ...allMessagesFor(EMPTY_ORDER_BUYER),
      ...allMessagesFor({
        firstName: 'L'.repeat(BUYER_NAME_MAX_LENGTH + 1),
        lastName: 'B'.repeat(BUYER_NAME_MAX_LENGTH + 1),
        email: `${'l'.repeat(BUYER_EMAIL_MAX_LENGTH)}@example.de`,
      }),
    ];

    expect(messages).toHaveLength(6);

    for (const message of messages) {
      expect(message).not.toMatch(EMBARGOED_MECHANICS);
      expect(message).not.toMatch(PLATZ_LANGUAGE);
    }
  });
});
