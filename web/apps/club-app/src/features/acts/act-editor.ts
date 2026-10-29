import type {
  ActForm,
  ActKind,
  ActWishBody,
  ActWishKind,
  CatalogueAct,
  Strength,
} from '@/features/running-order/schemas';
import { ACT_NAME_MAX_LENGTH, ACT_WISH_KINDS } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import type { CastDraft } from './act-cast';
import { castBodyOf, castDraftOf, EMPTY_CAST } from './act-cast';

export interface ActDraft {
  name: string;
  groupId: number | null;
  kind: ActKind | null;
  cast: CastDraft;
  wishes: ActWishBody[];
}

export type NameIssue = 'missing' | 'tooLong';

export interface EditorState {
  dirty: boolean;
  nameIssue: NameIssue | null;
  canSave: boolean;
}

const wishOrder = (kind: ActWishKind): number => ACT_WISH_KINDS.indexOf(kind);

const sortedWishes = (wishes: readonly ActWishBody[]): ActWishBody[] =>
  [...wishes].sort((left, right) => wishOrder(left.kind) - wishOrder(right.kind));

export const draftOfAct = (act: CatalogueAct): ActDraft => ({
  name: act.name,
  groupId: act.group?.groupId ?? null,
  kind: act.kind,
  cast: castDraftOf(act),
  wishes: sortedWishes(act.wishes.map(({ kind, strength }) => ({ kind, strength }))),
});

export const newActDraft = (groupId: number | null): ActDraft => ({
  name: '',
  groupId,
  kind: null,
  cast: EMPTY_CAST,
  wishes: [],
});

export const nameIssueOf = (name: string): NameIssue | null => {
  const trimmed = name.trim();

  if (trimmed === '') {
    return 'missing';
  }

  return trimmed.length > ACT_NAME_MAX_LENGTH ? 'tooLong' : null;
};

const fingerprintOf = (draft: ActDraft): string =>
  JSON.stringify({
    name: draft.name.trim(),
    groupId: draft.groupId,
    kind: draft.kind,
    removed: [...draft.cast.removedIds].sort((left, right) => left - right),
    added: draft.cast.added.map((person) => person.personId).sort((left, right) => left - right),
    wishes: sortedWishes(draft.wishes),
  });

export const editorStateOf = (initial: ActDraft, draft: ActDraft, isNew: boolean): EditorState => {
  const dirty = fingerprintOf(initial) !== fingerprintOf(draft);
  const nameIssue = nameIssueOf(draft.name);

  return { dirty, nameIssue, canSave: nameIssue === null && (dirty || isNew) };
};

export const withWish = (draft: ActDraft, kind: ActWishKind, strength: Strength): ActDraft => ({
  ...draft,
  wishes: sortedWishes([...draft.wishes.filter((wish) => wish.kind !== kind), { kind, strength }]),
});

export const withoutWish = (draft: ActDraft, kind: ActWishKind): ActDraft => ({
  ...draft,
  wishes: draft.wishes.filter((wish) => wish.kind !== kind),
});

export const withGroup = (draft: ActDraft, groupId: number | null): ActDraft =>
  draft.groupId === groupId
    ? draft
    : { ...draft, groupId, cast: { removedIds: [], added: draft.cast.added } };

export const actBodyOf = (draft: ActDraft, members: readonly PortraitPersonRef[]): ActForm => ({
  name: draft.name.trim(),
  groupId: draft.groupId,
  kind: draft.kind,
  ...castBodyOf(draft.cast, members, draft.groupId !== null),
  wishes: sortedWishes(draft.wishes),
});
