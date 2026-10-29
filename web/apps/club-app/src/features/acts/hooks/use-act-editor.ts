import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import { useState } from 'react';
import { useGroupHubQuery } from '@/features/group-hub/api';
import { useGroupsQuery } from '@/features/groups/api';
import { useActMutations } from '@/features/running-order/api';
import { toActKindLabel } from '@/features/running-order/running-order-copy';
import type {
  ActGroup,
  ActKind,
  ActRef,
  ActWishKind,
  CatalogueAct,
  Strength,
} from '@/features/running-order/schemas';
import { ACT_KINDS } from '@/features/running-order/schemas';
import type { PersonRef, PortraitPersonRef } from '@/lib/api/schemas';
import { relevantSessionYear } from '@/lib/club';
import { useNow } from '@/lib/use-now';
import type { CastTally, CastTile } from '../act-cast';
import {
  addCastPerson,
  castTallyOf,
  castTilesOf,
  membersOfAct,
  presentPeopleOf,
  toggleCastPerson,
} from '../act-cast';
import type { ActDraft, EditorState } from '../act-editor';
import {
  actBodyOf,
  draftOfAct,
  editorStateOf,
  isTimelessKind,
  newActDraft,
  sessionYearsToChoose,
  withGroup,
  withKind,
  withoutWish,
  withWish,
} from '../act-editor';
import { knownGroupsOf } from '../acts-catalogue';
import { KIND_ICONS, NO_GROUP_OPTION, toSessionLabel } from '../acts-copy';
import type { SharedAct } from '../acts-overlap';
import { sharedActsOf } from '../acts-overlap';

const NO_MEMBERS: readonly PortraitPersonRef[] = [];

const kindChoicesOf = (closed: boolean): KkChoiceChip[] =>
  ACT_KINDS.map((kind) => ({
    id: kind,
    label: toActKindLabel(kind),
    icon: KIND_ICONS[kind],
    disabled: closed,
  }));
const CLOCK_MS = 60_000;

export interface ActEditor {
  act: CatalogueAct | null;
  isNew: boolean;
  closed: boolean;
  draft: ActDraft;
  state: EditorState;
  showsNameIssue: boolean;
  headerAct: ActRef;
  grouped: boolean;
  canChooseGroup: boolean;
  groupChoices: KkChoiceChip[];
  kindChoices: KkChoiceChip[];
  showsSession: boolean;
  sessionChoices: KkChoiceChip[];
  membersLoading: boolean;
  tiles: CastTile[];
  tally: CastTally;
  shared: SharedAct[];
  isAdding: boolean;
  wishStrength: Strength;
  isSaving: boolean;
  isArchiving: boolean;
  rename: (name: string) => void;
  chooseKind: (kind: ActKind) => void;
  chooseSession: (value: string) => void;
  chooseGroup: (value: string) => void;
  toggleCast: (personId: number) => void;
  openAdding: () => void;
  closeAdding: () => void;
  addPerson: (person: PersonRef) => void;
  chooseWishStrength: (strength: Strength) => void;
  addWish: (kind: ActWishKind) => void;
  removeWish: (kind: ActWishKind) => void;
  save: () => void;
  toggleArchived: () => void;
}

interface ActEditorOptions {
  act: CatalogueAct | null;
  acts: readonly CatalogueAct[];
  fixedGroupId: number | null;
  onCreated: (actId: number, sessionYear: number | null) => void;
}

const groupOf = (
  groupId: number | null,
  act: CatalogueAct | null,
  hubGroup: ActGroup | null,
  listed: readonly ActGroup[],
): ActGroup | null => {
  if (groupId === null) {
    return null;
  }
  if (hubGroup?.groupId === groupId) {
    return hubGroup;
  }
  if (act?.group?.groupId === groupId) {
    return act.group;
  }

  return listed.find((group) => group.groupId === groupId) ?? null;
};

export const useActEditor = ({
  act,
  acts,
  fixedGroupId,
  onCreated,
}: ActEditorOptions): ActEditor => {
  const isNew = act === null;
  const closed = act?.closed === true;
  const now = useNow(CLOCK_MS);
  const relevantYear = relevantSessionYear(now);
  const initial = act === null ? newActDraft(fixedGroupId) : draftOfAct(act);
  const [draft, setDraft] = useState<ActDraft>(initial);
  const [touched, setTouched] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [wishStrength, setWishStrength] = useState<Strength>('must');
  const canChooseGroup = fixedGroupId === null;
  const groups = useGroupsQuery(canChooseGroup);
  const hub = useGroupHubQuery(draft.groupId);
  const mutations = useActMutations();
  const grouped = draft.groupId !== null;
  const hubData = hub.data?.groupId === draft.groupId ? hub.data : undefined;
  const fallbackMembers =
    act !== null && act.group?.groupId === draft.groupId ? membersOfAct(act) : NO_MEMBERS;
  const members: readonly PortraitPersonRef[] = hubData?.members ?? fallbackMembers;
  const listedGroups = knownGroupsOf(
    (groups.data?.groups ?? []).map((group) => ({
      groupId: group.groupId,
      name: group.name,
      tone: group.tone,
      icon: group.icon,
      picture: group.picture,
    })),
    acts,
  );
  const hubGroup: ActGroup | null =
    hubData === undefined
      ? null
      : {
          groupId: hubData.groupId,
          name: hubData.name,
          tone: hubData.tone,
          icon: hubData.icon,
          picture: hubData.picture,
        };
  const tiles = castTilesOf(members, draft.cast, grouped);
  const groupChoices: KkChoiceChip[] = [
    { id: '', label: NO_GROUP_OPTION, icon: 'flag' },
    ...listedGroups.map((group) => ({ id: String(group.groupId), label: group.name })),
  ];
  const sessionChoices: KkChoiceChip[] = sessionYearsToChoose(relevantYear, draft.sessionYear).map(
    (year) => ({ id: String(year), label: toSessionLabel(year), disabled: closed }),
  );
  const state = editorStateOf(initial, draft, isNew, closed);
  const update = (next: (current: ActDraft) => ActDraft): void => {
    if (closed) {
      return;
    }

    setDraft((current) => next(current));
  };

  return {
    act,
    isNew,
    closed,
    draft,
    state,
    showsNameIssue: touched && state.nameIssue !== null,
    headerAct: {
      actId: act?.actId ?? 0,
      name: draft.name,
      kind: draft.kind,
      group: groupOf(draft.groupId, act, hubGroup, listedGroups),
    },
    grouped,
    canChooseGroup,
    groupChoices,
    kindChoices: kindChoicesOf(closed),
    showsSession: !isTimelessKind(draft.kind),
    sessionChoices,
    membersLoading:
      grouped && hubData === undefined && fallbackMembers.length === 0 && hub.isPending,
    tiles,
    tally: castTallyOf(tiles),
    shared: sharedActsOf(act?.actId ?? null, presentPeopleOf(tiles), acts),
    isAdding,
    wishStrength,
    isSaving: mutations.create.isPending || mutations.update.isPending,
    isArchiving: mutations.archive.isPending,
    rename: (name) => {
      setTouched(true);
      update((current) => ({ ...current, name }));
    },
    chooseKind: (kind) => {
      update((current) => withKind(current, kind, relevantYear));
    },
    chooseSession: (value) => {
      update((current) => ({ ...current, sessionYear: Number(value) }));
    },
    chooseGroup: (value) => {
      const groupId = value === '' ? null : Number(value);

      update((current) => withGroup(current, groupId));
    },
    toggleCast: (personId) => {
      update((current) => ({
        ...current,
        cast: toggleCastPerson(current.cast, members, current.groupId !== null, personId),
      }));
    },
    openAdding: () => {
      setIsAdding(true);
    },
    closeAdding: () => {
      setIsAdding(false);
    },
    addPerson: (person) => {
      update((current) => ({
        ...current,
        cast: addCastPerson(current.cast, members, current.groupId !== null, {
          ...person,
          portrait: null,
        }),
      }));
    },
    chooseWishStrength: (strength) => {
      setWishStrength(strength);
    },
    addWish: (kind) => {
      update((current) => withWish(current, kind, wishStrength));
    },
    removeWish: (kind) => {
      update((current) => withoutWish(current, kind));
    },
    save: () => {
      setTouched(true);
      if (!state.canSave) {
        return;
      }

      const form = actBodyOf(draft, members);

      if (act === null) {
        mutations.create.mutate(form, {
          onSuccess: (created) => {
            onCreated(created.actId, form.sessionYear);
          },
        });
        return;
      }

      mutations.update.mutate({ actId: act.actId, form });
    },
    toggleArchived: () => {
      if (act === null || closed) {
        return;
      }

      mutations.archive.mutate({ actId: act.actId, name: act.name, archived: !act.archived });
    },
  };
};
