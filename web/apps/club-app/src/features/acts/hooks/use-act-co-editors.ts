import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import type { CastPerson } from '@/features/running-order/schemas';
import { canChangeCoEditors, coEditorCandidatesOf } from '../act-studio';
import { toFullName } from '../acts-copy';
import { useCoEditorMutations } from '../api';
import type { ActStudioResponse, CoEditor } from '../schemas';

export interface ActCoEditors {
  coEditors: readonly CoEditor[];
  canChange: boolean;
  candidates: KkChoiceChip[];
  isBusy: boolean;
  grant: (personId: string) => void;
  revoke: (coEditor: CoEditor) => void;
}

const choiceOf =
  (disabled: boolean) =>
  (person: CastPerson): KkChoiceChip => ({
    id: String(person.personId),
    label: toFullName(person.firstName, person.lastName),
    disabled,
  });

export const useActCoEditors = (page: ActStudioResponse): ActCoEditors => {
  const mutations = useCoEditorMutations(page.act.actId);
  const candidates = coEditorCandidatesOf(page.act.cast, page.coEditors);
  const canChange = canChangeCoEditors(page.viewer.canGrantCoEditors, page.act);
  const isBusy = mutations.grant.isPending || mutations.revoke.isPending;

  return {
    coEditors: page.coEditors,
    canChange,
    candidates: canChange ? candidates.map(choiceOf(isBusy)) : [],
    isBusy,
    grant: (id) => {
      const person = candidates.find((candidate) => String(candidate.personId) === id);

      if (person !== undefined && !isBusy) {
        mutations.grant.mutate({
          personId: person.personId,
          name: toFullName(person.firstName, person.lastName),
        });
      }
    },
    revoke: (coEditor) => {
      mutations.revoke.mutate({
        personId: coEditor.personId,
        name: toFullName(coEditor.firstName, coEditor.lastName),
      });
    },
  };
};
