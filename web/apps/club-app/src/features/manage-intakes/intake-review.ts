import { parsePositiveId } from '@/lib/positive-id';
import type { IntakeCandidate } from './schemas';

export type ReviewChoice = string;

export type ReviewResolution =
  | { kind: 'newPerson' }
  | { kind: 'existingPerson'; personId: number }
  | { kind: 'invalid' };

export const NEW_PERSON_CHOICE: ReviewChoice = 'new';

export const toCandidateChoice = (candidate: IntakeCandidate): ReviewChoice =>
  String(candidate.personId);

export const toReviewResolution = (choice: ReviewChoice | null): ReviewResolution => {
  if (choice === NEW_PERSON_CHOICE) {
    return { kind: 'newPerson' };
  }

  const personId = choice === null ? null : parsePositiveId(choice);

  return personId === null ? { kind: 'invalid' } : { kind: 'existingPerson', personId };
};
