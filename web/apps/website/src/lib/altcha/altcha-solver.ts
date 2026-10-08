import { solveChallengeWorkers } from 'altcha/lib';
import Pbkdf2Worker from 'altcha/workers/pbkdf2?worker';
import { encodeAltchaPayload } from './altcha-proof';
import type { AltchaChallenge } from './schemas';

export class AltchaUnsolvedError extends Error {
  constructor() {
    super('The proof of work was aborted or timed out before a solution was found.');
    this.name = 'AltchaUnsolvedError';
  }
}

const createPbkdf2Worker = (): Worker => new Pbkdf2Worker();

const controllerFollowing = (signal: AbortSignal): AbortController => {
  const controller = new AbortController();
  signal.addEventListener('abort', () => {
    controller.abort();
  });
  return controller;
};

export const solveAltchaChallenge = async (
  challenge: AltchaChallenge,
  signal: AbortSignal,
): Promise<string> => {
  const solution = await solveChallengeWorkers({
    challenge,
    controller: controllerFollowing(signal),
    concurrency: navigator.hardwareConcurrency,
    createWorker: createPbkdf2Worker,
  });

  if (solution === null) {
    throw new AltchaUnsolvedError();
  }

  return encodeAltchaPayload(challenge, solution);
};
