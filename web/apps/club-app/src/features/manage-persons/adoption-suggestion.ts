import { z } from 'zod';
import type { AdoptionCandidate } from './schemas';

const EmailSchema = z.email();

export const toAdoptionQueryEmail = (typedEmail: string, isCreating: boolean): string | null => {
  if (!isCreating) {
    return null;
  }

  const email = typedEmail.trim().toLowerCase();

  return EmailSchema.safeParse(email).success ? email : null;
};

interface AdoptionSuggestionInput {
  queryEmail: string | null;
  searchedEmail: string | null;
  candidate: AdoptionCandidate | null | undefined;
}

export const toAdoptionSuggestion = ({
  queryEmail,
  searchedEmail,
  candidate,
}: AdoptionSuggestionInput): AdoptionCandidate | null => {
  if (queryEmail === null || queryEmail !== searchedEmail || candidate === undefined) {
    return null;
  }

  return candidate;
};

export const toAdoptionLine = (candidate: AdoptionCandidate): string =>
  `Es gibt schon ${candidate.firstName} ${candidate.lastName} mit dieser Adresse — nicht im Verein aktiv.`;
