import type { KkChipTone } from '@furria/ui/KkChip';
import type { KkLinkSearch } from '@furria/ui/kk-link-search';
import { useEveningMutations } from '@/features/act-studio/evening-api';
import { eveningEntryOf } from '../act-evenings';
import { EVENING_CHANGED_HINT, toEveningMeta, toEveningStateChip } from '../act-evenings-copy';
import { canPractise } from '../act-studio';
import type { ActStudioResponse, Studio } from '../schemas';

const CURRENT_ROUTE = '.';

export interface ActEveningRowState {
  eventId: number;
  label: string;
  meta: string;
  stateLabel: string;
  stateTone: KkChipTone;
  changedFlag: string | undefined;
  to: string | null;
  search: KkLinkSearch;
  canJoin: boolean;
}

export interface ActEvenings {
  rows: ActEveningRowState[];
  isJoining: boolean;
  join: (eventId: number) => void;
}

const DETAILS_VIEW = 'details';

const searchOf =
  (eventId: number, opensPane: boolean): KkLinkSearch =>
  ({ view: _view, settings: _settings, edit: _edit, roll: _roll, ...kept }) =>
    opensPane ? { ...kept, view: DETAILS_VIEW, evening: eventId } : { ...kept, evening: eventId };

export const useActEvenings = (data: ActStudioResponse, studio: Studio): ActEvenings => {
  const mutations = useEveningMutations(data.act.actId);
  const canEdit = data.viewer.canEditStudio;
  const practisable = canPractise(studio);

  return {
    rows: studio.evenings.map((evening) => {
      const entry = eveningEntryOf(evening, studio.choreography);
      const reachable = canEdit || (practisable && entry.state !== 'open');
      const chip = toEveningStateChip(entry.state);

      return {
        eventId: evening.eventId,
        label: evening.title,
        meta: toEveningMeta(evening),
        stateLabel: chip.label,
        stateTone: chip.tone,
        changedFlag: entry.changes.length === 0 ? undefined : EVENING_CHANGED_HINT,
        to: reachable ? CURRENT_ROUTE : null,
        search: searchOf(evening.eventId, canEdit),
        canJoin: canEdit && entry.state === 'open',
      };
    }),
    isJoining: mutations.join.isPending,
    join: (eventId) => {
      mutations.join.mutate(eventId);
    },
  };
};
