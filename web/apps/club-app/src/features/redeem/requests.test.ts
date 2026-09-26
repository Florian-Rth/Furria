import { describe, expect, it } from 'vitest';
import type { JsonBody } from '@/lib/api/api-fetch';
import type { ResolvedClaimProof } from './requests';
import { toClaimBody } from './requests';

describe('toClaimBody', () => {
  it.each<[string, ResolvedClaimProof | null, { [key: string]: JsonBody }]>([
    ['no claim', null, { claimPassword: null, claimPasskey: null }],
    [
      'a password claim',
      { kind: 'password', password: 'Altes-Passwort-1!' },
      { claimPassword: 'Altes-Passwort-1!', claimPasskey: null },
    ],
    [
      'a passkey claim',
      {
        kind: 'passkey',
        attempt: {
          challengeId: 'challenge-1',
          credential: {
            id: 'cred',
            rawId: 'cred',
            type: 'public-key',
            authenticatorAttachment: null,
            response: {
              clientDataJSON: 'data',
              authenticatorData: 'auth',
              signature: 'sig',
              userHandle: null,
            },
          },
        },
      },
      {
        claimPassword: null,
        claimPasskey: {
          challengeId: 'challenge-1',
          credential: {
            id: 'cred',
            rawId: 'cred',
            type: 'public-key',
            authenticatorAttachment: null,
            response: {
              clientDataJSON: 'data',
              authenticatorData: 'auth',
              signature: 'sig',
              userHandle: null,
            },
            clientExtensionResults: {},
          },
        },
      },
    ],
  ])('sends %s', (_case, proof, expected) => {
    expect(toClaimBody(proof)).toEqual(expected);
  });
});
