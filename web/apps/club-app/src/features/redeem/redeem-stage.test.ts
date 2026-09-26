import { describe, expect, it } from 'vitest';
import type { RedeemStage } from './redeem-stage';
import { needsEmailConfirmation, toRedeemStage } from './redeem-stage';

type StageInput = Parameters<typeof toRedeemStage>[0];

describe('toRedeemStage', () => {
  it.each<[string, StageInput, RedeemStage]>([
    [
      'a missing credential',
      {
        credential: null,
        isSignedIn: false,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: null,
      },
      { kind: 'dead' },
    ],
    [
      'a missing credential while signed in',
      {
        credential: null,
        isSignedIn: true,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: null,
      },
      { kind: 'dead' },
    ],
    [
      'a signed-in visitor with a token',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: true,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: null,
      },
      { kind: 'signedIn' },
    ],
    [
      'a lookup still running',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: false,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: null,
      },
      { kind: 'checking' },
    ],
    [
      'a live invitation',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: false,
        lookup: {
          status: 'live',
          firstName: 'Anna',
          loginEmail: 'anna@web.de',
          contactEmailTaken: false,
        },
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: null,
      },
      {
        kind: 'live',
        credential: { kind: 'token', token: 'abc' },
        firstName: 'Anna',
        suggestedLoginEmail: 'anna@web.de',
        contactEmailTaken: false,
        step: { kind: 'details' },
      },
    ],
    [
      'a live invitation reached by code whose inbox is already someone’s login',
      {
        credential: { kind: 'code', code: 'K7M4-Q2XP' },
        isSignedIn: false,
        lookup: { status: 'live', firstName: 'Anna', loginEmail: null, contactEmailTaken: true },
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: null,
      },
      {
        kind: 'live',
        credential: { kind: 'code', code: 'K7M4-Q2XP' },
        firstName: 'Anna',
        suggestedLoginEmail: null,
        contactEmailTaken: true,
        step: { kind: 'details' },
      },
    ],
    [
      'a mailed confirmation code',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: false,
        lookup: {
          status: 'live',
          firstName: 'Anna',
          loginEmail: 'anna@web.de',
          contactEmailTaken: false,
        },
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: {
          loginEmail: 'anna@privat.de',
          password: 'Neues-Passwort-2026!',
          expiresAt: '2026-09-26T12:15:00+00:00',
        },
      },
      {
        kind: 'live',
        credential: { kind: 'token', token: 'abc' },
        firstName: 'Anna',
        suggestedLoginEmail: 'anna@web.de',
        contactEmailTaken: false,
        step: {
          kind: 'confirm',
          loginEmail: 'anna@privat.de',
          expiresAt: '2026-09-26T12:15:00+00:00',
        },
      },
    ],
    [
      'a rejected confirmation code',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: false,
        lookup: {
          status: 'live',
          firstName: 'Anna',
          loginEmail: 'anna@web.de',
          contactEmailTaken: false,
        },
        lookupFailure: null,
        redeemFailure: 'codeRejected',
        pendingConfirmation: {
          loginEmail: 'anna@privat.de',
          password: 'Neues-Passwort-2026!',
          expiresAt: '2026-09-26T12:15:00+00:00',
        },
      },
      {
        kind: 'live',
        credential: { kind: 'token', token: 'abc' },
        firstName: 'Anna',
        suggestedLoginEmail: 'anna@web.de',
        contactEmailTaken: false,
        step: {
          kind: 'confirm',
          loginEmail: 'anna@privat.de',
          expiresAt: '2026-09-26T12:15:00+00:00',
        },
      },
    ],
    [
      'a login email taken while the code was on its way',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: false,
        lookup: {
          status: 'live',
          firstName: 'Anna',
          loginEmail: 'anna@web.de',
          contactEmailTaken: false,
        },
        lookupFailure: null,
        redeemFailure: 'taken',
        pendingConfirmation: {
          loginEmail: 'anna@privat.de',
          password: 'Neues-Passwort-2026!',
          expiresAt: '2026-09-26T12:15:00+00:00',
        },
      },
      {
        kind: 'live',
        credential: { kind: 'token', token: 'abc' },
        firstName: 'Anna',
        suggestedLoginEmail: 'anna@web.de',
        contactEmailTaken: false,
        step: { kind: 'details' },
      },
    ],
    [
      'a dead invitation',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: false,
        lookup: { status: 'dead', firstName: null, loginEmail: null, contactEmailTaken: null },
        lookupFailure: null,
        redeemFailure: null,
        pendingConfirmation: null,
      },
      { kind: 'dead' },
    ],
    [
      'a redemption refused as dead',
      {
        credential: { kind: 'code', code: 'K7M4-Q2XP' },
        isSignedIn: false,
        lookup: {
          status: 'live',
          firstName: 'Anna',
          loginEmail: 'anna@web.de',
          contactEmailTaken: false,
        },
        lookupFailure: null,
        redeemFailure: 'dead',
        pendingConfirmation: null,
      },
      { kind: 'dead' },
    ],
    [
      'a failed lookup',
      {
        credential: { kind: 'token', token: 'abc' },
        isSignedIn: false,
        lookup: undefined,
        lookupFailure: 'throttled',
        redeemFailure: null,
        pendingConfirmation: null,
      },
      { kind: 'failed', failure: 'throttled' },
    ],
  ])('decides the stage for %s', (_case, input, expected) => {
    expect(toRedeemStage(input)).toEqual(expected);
  });
});

describe('needsEmailConfirmation', () => {
  it.each<[string, string, string | null, boolean]>([
    ['the suggested address', 'anna@web.de', 'anna@web.de', false],
    ['the suggested address in other case and with blanks', ' Anna@Web.de ', 'anna@web.de', false],
    ['another address', 'anna@privat.de', 'anna@web.de', true],
    ['any address when nothing was suggested', 'anna@privat.de', null, true],
    ['an empty field', '  ', 'anna@web.de', false],
    ['an empty field with nothing suggested', '', null, false],
  ])('decides for %s', (_case, typed, suggested, expected) => {
    expect(needsEmailConfirmation(typed, suggested)).toBe(expected);
  });
});
