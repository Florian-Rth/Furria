import type {
  ActForm,
  ActKind,
  ActWishBody,
  ActWishKind,
  CatalogueAct,
  Strength,
} from '@/features/running-order/schemas';
import { ACT_NAME_MAX_LENGTH, ACT_WISH_KINDS } from '@/features/running-order/schemas';

export interface ActDraft {
  name: string;
  groupId: number | null;
  kind: ActKind | null;
  sessionYear: number | null;
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
  sessionYear: act.sessionYear,
  wishes: sortedWishes(act.wishes.map(({ kind, strength }) => ({ kind, strength }))),
});

export const newActDraft = (groupId: number | null): ActDraft => ({
  name: '',
  groupId,
  kind: null,
  sessionYear: null,
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
    sessionYear: draft.sessionYear,
    wishes: sortedWishes(draft.wishes),
  });

export const editorStateOf = (
  initial: ActDraft,
  draft: ActDraft,
  isNew: boolean,
  closed: boolean,
): EditorState => {
  const dirty = fingerprintOf(initial) !== fingerprintOf(draft);
  const nameIssue = nameIssueOf(draft.name);

  return { dirty, nameIssue, canSave: !closed && nameIssue === null && (dirty || isNew) };
};

export const isTimelessKind = (kind: ActKind | null): boolean => kind === null || kind === 'point';

export const withKind = (draft: ActDraft, kind: ActKind, relevantYear: number): ActDraft => {
  const next = draft.kind === kind ? null : kind;

  return {
    ...draft,
    kind: next,
    sessionYear: isTimelessKind(next) ? null : (draft.sessionYear ?? relevantYear),
  };
};

export const sessionYearsToChoose = (relevantYear: number, chosen: number | null): number[] => {
  const offered = [relevantYear, relevantYear + 1];

  return chosen === null || offered.includes(chosen)
    ? offered
    : [...offered, chosen].sort((left, right) => left - right);
};

export const withWish = (draft: ActDraft, kind: ActWishKind, strength: Strength): ActDraft => ({
  ...draft,
  wishes: sortedWishes([...draft.wishes.filter((wish) => wish.kind !== kind), { kind, strength }]),
});

export const withoutWish = (draft: ActDraft, kind: ActWishKind): ActDraft => ({
  ...draft,
  wishes: draft.wishes.filter((wish) => wish.kind !== kind),
});

export const actBodyOf = (draft: ActDraft): ActForm => ({
  name: draft.name.trim(),
  groupId: draft.groupId,
  kind: draft.kind,
  sessionYear: draft.sessionYear,
  wishes: sortedWishes(draft.wishes),
});
