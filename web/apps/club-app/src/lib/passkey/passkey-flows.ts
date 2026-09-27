import type { MePasskey } from '@/lib/api/schemas';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { assertPasskey, createPasskey } from './passkey-ceremony';
import type { PasskeyAssertionJson } from './passkey-json';
import {
  requestPasskeyAddition,
  requestPasskeyCreationChallenge,
  requestPasskeyRequestChallenge,
} from './passkey-requests';

export interface PasskeyAssertionAttempt {
  challengeId: string;
  credential: PasskeyAssertionJson;
}

export const addPasskey = async (): Promise<MePasskey> => {
  const challenge = await withFreshAccessToken(requestPasskeyCreationChallenge);
  const credential = await createPasskey(challenge.options);

  return await withFreshAccessToken((accessToken) =>
    requestPasskeyAddition(challenge.challengeId, credential, accessToken),
  );
};

export const provePasskey = async (): Promise<PasskeyAssertionAttempt> => {
  const challenge = await requestPasskeyRequestChallenge();
  const credential = await assertPasskey(challenge.options);

  return { challengeId: challenge.challengeId, credential };
};
