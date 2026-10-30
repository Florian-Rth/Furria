import { toImageSource } from '@furria/ui/image-source';
import type { KkCastTile } from '@furria/ui/KkCastGrid';
import type { KkStepState } from '@furria/ui/step-state';
import { useState } from 'react';
import { useEveningMutations } from '@/features/act-studio/evening-api';
import { castTilesOf } from '@/features/acts/act-cast';
import { dancerToggleOf } from '@/features/acts/act-evenings';
import { GUEST_BADGE, toShortName, toTileStateLabel } from '@/features/acts/acts-copy';
import { cellOf, readinessOf } from '@/features/season/season-grid';
import type { PersonRef } from '@/lib/api/schemas';
import { toInitials } from '@/lib/initials';
import {
  CHECK_DONE,
  CHECK_LABELS,
  CHECK_OPEN,
  toCastChangeLine,
  toEveningDay,
  toEveningRowMeta,
  toPaneEyebrow,
} from '../season-c-copy';
import type { DotKind } from '../season-c-rows';
import { checkStatesOf, dotOf } from '../season-c-rows';
import type { SeasonCSelection } from './use-season-c';

export interface SeasonCPaneCheck {
  key: string;
  label: string;
  value: string;
  state: KkStepState;
}

export interface SeasonCPaneEvening {
  eventId: number;
  title: string;
  day: string;
  meta: string;
  kind: DotKind;
  on: boolean;
  pending: boolean;
  toggle: () => void;
  changeLine: string;
  castOpen: boolean;
  toggleCast: () => void;
  tiles: KkCastTile[];
  togglePerson: (personId: number) => void;
  adding: boolean;
  openAdding: () => void;
  closeAdding: () => void;
  addPerson: (person: PersonRef) => void;
}

export interface SeasonCPane {
  title: string;
  eyebrow: string;
  checks: SeasonCPaneCheck[];
  evenings: SeasonCPaneEvening[];
}

const nameOf = (person: { firstName: string; lastName: string }): string =>
  toShortName(person.firstName, person.lastName);

export const useSeasonCPane = (selection: SeasonCSelection): SeasonCPane => {
  const { act, catalogueAct, evenings, toggle, pendingEventId } = selection;
  const mutations = useEveningMutations(act.actId);
  const [addingEventId, setAddingEventId] = useState<number | null>(null);
  const [castEventId, setCastEventId] = useState<number | null>(null);
  const readiness = readinessOf(act);
  const sessionCast = catalogueAct?.cast ?? [];

  return {
    title: act.name,
    eyebrow: toPaneEyebrow(act.group?.name ?? null, readiness.done, readiness.total),
    checks: checkStatesOf(act)
      .filter(({ mark }) => mark !== 'none')
      .map(({ check, mark }) => ({
        key: check,
        label: CHECK_LABELS[check],
        value: mark === 'done' ? CHECK_DONE : CHECK_OPEN,
        state: mark === 'done' ? 'done' : 'open',
      })),
    evenings: evenings.map((evening) => {
      const eventId = evening.eventId;
      const dot = dotOf(act, eventId);
      const appearance = cellOf(act, eventId).appearance;
      const castTiles =
        appearance === null
          ? []
          : castTilesOf(
              sessionCast,
              {
                removedIds: appearance.removed.map((person) => person.personId),
                added: appearance.added,
              },
              true,
            );

      return {
        eventId,
        title: evening.title,
        day: toEveningDay(evening.startsAt),
        meta: toEveningRowMeta(dot.kind, dot.number),
        kind: dot.kind,
        on: dot.kind !== 'none',
        pending: pendingEventId === eventId,
        toggle: () => {
          toggle(eventId);
        },
        changeLine: toCastChangeLine(
          appearance?.removed.map(nameOf) ?? [],
          appearance?.added.map(nameOf) ?? [],
        ),
        castOpen: castEventId === eventId && appearance !== null,
        toggleCast: () => {
          setCastEventId((current) => (current === eventId ? null : eventId));
          setAddingEventId(null);
        },
        tiles: castTiles.map(({ person, state }) => ({
          id: person.personId,
          name: nameOf(person),
          initials: toInitials(person.firstName, person.lastName),
          portrait: toImageSource(person.portrait, 'portrait'),
          state,
          badge: state === 'guest' ? GUEST_BADGE : null,
          stateLabel: toTileStateLabel(state),
        })),
        togglePerson: (personId) => {
          const tile = castTiles.find((candidate) => candidate.person.personId === personId);
          if (tile !== undefined) {
            mutations.dancer.mutate({ eventId, ...dancerToggleOf(tile) });
          }
        },
        adding: addingEventId === eventId,
        openAdding: () => {
          setAddingEventId(eventId);
        },
        closeAdding: () => {
          setAddingEventId(null);
        },
        addPerson: (person) => {
          mutations.dancer.mutate({ eventId, person: { ...person, portrait: null }, dances: true });
        },
      };
    }),
  };
};
