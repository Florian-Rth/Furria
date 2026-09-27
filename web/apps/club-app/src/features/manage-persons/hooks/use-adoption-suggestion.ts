import { useNavigate } from '@tanstack/react-router';
import { useDebouncedValue } from '@/lib/use-debounced-value';
import { toAdoptionQueryEmail, toAdoptionSuggestion } from '../adoption-suggestion';
import { useAdoptionCandidateQuery } from '../api';
import type { AdoptionCandidate } from '../schemas';

const TYPING_PAUSE_MS = 400;

export interface AdoptionSuggestionControl {
  candidate: AdoptionCandidate | null;
  adopt: () => void;
}

export const useAdoptionSuggestion = (
  typedEmail: string,
  isCreating: boolean,
): AdoptionSuggestionControl => {
  const navigate = useNavigate();
  const queryEmail = toAdoptionQueryEmail(typedEmail, isCreating);
  const searchedEmail = useDebouncedValue(queryEmail, TYPING_PAUSE_MS);
  const search = useAdoptionCandidateQuery(searchedEmail);
  const candidate = toAdoptionSuggestion({ queryEmail, searchedEmail, candidate: search.data });

  const adopt = (): void => {
    if (candidate === null) {
      return;
    }

    void navigate({
      to: '/manage/persons/$personId',
      params: { personId: String(candidate.personId) },
      replace: true,
      ignoreBlocker: true,
    });
  };

  return { candidate, adopt };
};
