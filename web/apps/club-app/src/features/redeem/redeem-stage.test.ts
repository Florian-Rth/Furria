import { describe, expect, it } from 'vitest';
import type { RedeemStage } from './redeem-stage';
import { toRedeemStage } from './redeem-stage';

type StageInput = Parameters<typeof toRedeemStage>[0];

describe('toRedeemStage', () => {
  it.each<[string, StageInput, RedeemStage]>([
    [
      'a missing token',
      {
        token: null,
        isSignedIn: false,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
      },
      { kind: 'dead' },
    ],
    [
      'a missing token while signed in',
      {
        token: null,
        isSignedIn: true,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
      },
      { kind: 'dead' },
    ],
    [
      'a signed-in visitor with a token',
      {
        token: 'abc',
        isSignedIn: true,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
      },
      { kind: 'signedIn' },
    ],
    [
      'a lookup still running',
      {
        token: 'abc',
        isSignedIn: false,
        lookup: undefined,
        lookupFailure: null,
        redeemFailure: null,
      },
      { kind: 'checking' },
    ],
    [
      'a live invitation',
      {
        token: 'abc',
        isSignedIn: false,
        lookup: { status: 'live', firstName: 'Anna', loginEmail: 'anna@web.de' },
        lookupFailure: null,
        redeemFailure: null,
      },
      { kind: 'live', token: 'abc', firstName: 'Anna', loginEmail: 'anna@web.de' },
    ],
    [
      'a dead invitation',
      {
        token: 'abc',
        isSignedIn: false,
        lookup: { status: 'dead', firstName: null, loginEmail: null },
        lookupFailure: null,
        redeemFailure: null,
      },
      { kind: 'dead' },
    ],
    [
      'a redemption refused as dead',
      {
        token: 'abc',
        isSignedIn: false,
        lookup: { status: 'live', firstName: 'Anna', loginEmail: 'anna@web.de' },
        lookupFailure: null,
        redeemFailure: 'dead',
      },
      { kind: 'dead' },
    ],
    [
      'a redemption refused for another reason',
      {
        token: 'abc',
        isSignedIn: false,
        lookup: { status: 'live', firstName: 'Anna', loginEmail: 'anna@web.de' },
        lookupFailure: null,
        redeemFailure: 'throttled',
      },
      { kind: 'live', token: 'abc', firstName: 'Anna', loginEmail: 'anna@web.de' },
    ],
    [
      'a failed lookup',
      {
        token: 'abc',
        isSignedIn: false,
        lookup: undefined,
        lookupFailure: 'throttled',
        redeemFailure: null,
      },
      { kind: 'failed', failure: 'throttled' },
    ],
  ])('decides the stage for %s', (_case, input, expected) => {
    expect(toRedeemStage(input)).toEqual(expected);
  });
});
