import { describe, expect, it } from 'vitest';
import type { IntakeLookupStatus, IntakePageStage } from './intake-page';
import { intakePageStageOf, invitationHrefOf, toSubmitBody } from './intake-page';

const TOKEN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ';
const PENDING: IntakeLookupStatus = { state: null, failedStatus: null, failed: false };

describe('intakePageStageOf', () => {
  it.each<[string, string | null, IntakeLookupStatus, IntakePageStage]>([
    ['a link without token', null, PENDING, 'missing'],
    ['a lookup on its way', TOKEN, PENDING, 'checking'],
    ['an open link', TOKEN, { ...PENDING, state: 'open' }, 'open'],
    ['a used link', TOKEN, { ...PENDING, state: 'used' }, 'used'],
    ['a discarded link', TOKEN, { ...PENDING, state: 'discarded' }, 'discarded'],
    ['an expired link', TOKEN, { ...PENDING, state: 'expired' }, 'expired'],
    ['an unknown link', TOKEN, { state: null, failedStatus: 404, failed: true }, 'unknown'],
    [
      'a link voided while she was typing',
      TOKEN,
      { state: 'open', failedStatus: 404, failed: true },
      'unknown',
    ],
    [
      'an open link while the connection drops',
      TOKEN,
      { state: 'open', failedStatus: null, failed: true },
      'open',
    ],
    ['a malformed link', TOKEN, { state: null, failedStatus: 400, failed: true }, 'unknown'],
    ['an unreachable server', TOKEN, { state: null, failedStatus: null, failed: true }, 'failed'],
  ])('shows %s', (_, token, lookup, expected) => {
    expect(intakePageStageOf(token, lookup)).toBe(expected);
  });
});

describe('toSubmitBody', () => {
  const form = {
    firstName: 'Lena',
    lastName: 'Kraus',
    birthDate: '2012-04-03',
    email: '',
    phone: '0171 234567',
    street: 'Hauptstraße 4',
    zip: '61118',
    city: 'Bad Vilbel',
  };

  it('sends her address when she joins as a member and blanks as absent', () => {
    expect(toSubmitBody(TOKEN, form, true)).toEqual({
      token: TOKEN,
      firstName: 'Lena',
      lastName: 'Kraus',
      birthDate: '2012-04-03',
      street: 'Hauptstraße 4',
      zip: '61118',
      city: 'Bad Vilbel',
      phone: '0171 234567',
      email: null,
    });
  });

  it('leaves the address out when nobody asked for it', () => {
    expect(toSubmitBody(TOKEN, form, false)).toMatchObject({
      street: null,
      zip: null,
      city: null,
    });
  });
});

describe('invitationHrefOf', () => {
  it.each<[string, string | null, string | null]>([
    [
      'the invitation link of a fresh account',
      'https://app.example.org/invitation#token=Abc_123-xyz',
      '/invitation#token=Abc_123-xyz',
    ],
    ['no invitation', null, null],
    ['a link without token', 'https://app.example.org/invitation', null],
    ['no link at all', 'not a link', null],
  ])('hands over %s', (_, link, expected) => {
    expect(invitationHrefOf(link)).toBe(expected);
  });
});
