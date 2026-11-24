import { describe, expect, it } from 'vitest';
import { toSubmitBody } from './intake-page';

const TOKEN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQ';

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
    clubGroupConsent: true,
  };

  it('leaves the address out when nobody asked for it', () => {
    expect(toSubmitBody(TOKEN, form, false)).toMatchObject({
      street: null,
      zip: null,
      city: null,
    });
  });
});
