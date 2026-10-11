import { newsMentionKeyOf } from '@furria/ui/news-text';
import type { EditorState, Transaction } from 'prosemirror-state';
import { Plugin, PluginKey } from 'prosemirror-state';
import type { NewsMentionable } from '../types';
import { isMentionNode, mentionOf, nodes } from './news-text-schema';

const MENTION_LOOKBACK = 32;
const MENTION_PATTERN = /(?:^|\s)@([\p{L}\d-]*)$/u;
const OBJECT_REPLACEMENT = '￼';
const KIND_ORDER = { group: 0, person: 1 } as const;

export type MentionStep = 'next' | 'previous';

export interface MentionQuery {
  from: number;
  to: number;
  query: string;
}

export interface MentionPicker extends MentionQuery {
  choices: readonly NewsMentionable[];
  active: NewsMentionable | null;
}

export interface EditedMention {
  pos: number;
  id: string;
  label: string;
}

interface MentionDesk {
  mentionables: readonly NewsMentionable[];
  query: MentionQuery | null;
  dismissedAt: number | null;
  activeIndex: number;
  editedAt: number | null;
}

export type MentionDeskMeta =
  | { kind: 'offer'; mentionables: readonly NewsMentionable[] }
  | { kind: 'dismiss' }
  | { kind: 'step'; step: MentionStep }
  | { kind: 'edit'; pos: number | null };

const mentionDeskKey = new PluginKey<MentionDesk>('news-mention-desk');

const EMPTY_DESK: MentionDesk = {
  mentionables: [],
  query: null,
  dismissedAt: null,
  activeIndex: 0,
  editedAt: null,
};

const matchesMention = (mentionable: NewsMentionable, query: string): boolean => {
  const needle = query.trim().toLocaleLowerCase('de');
  if (needle.length === 0) {
    return true;
  }
  return [mentionable.name, mentionable.line].some((field) =>
    field
      .toLocaleLowerCase('de')
      .split(/\s+/)
      .some((word) => word.startsWith(needle)),
  );
};

const mentionChoicesOf = (
  mentionables: readonly NewsMentionable[],
  query: string,
): NewsMentionable[] =>
  mentionables
    .filter((mentionable) => mentionable.isPublic && matchesMention(mentionable, query))
    .sort((left, right) => KIND_ORDER[left.kind] - KIND_ORDER[right.kind]);

const steppedIndexOf = (index: number, count: number, step: MentionStep): number => {
  if (count === 0) {
    return 0;
  }
  return step === 'next' ? (index + 1) % count : (index - 1 + count) % count;
};

const queryAt = (state: EditorState): MentionQuery | null => {
  const { $from, empty } = state.selection;
  if (!empty || !$from.parent.isTextblock || $from.parent.type === nodes.heading) {
    return null;
  }
  const textBefore = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - MENTION_LOOKBACK),
    $from.parentOffset,
    undefined,
    OBJECT_REPLACEMENT,
  );
  const match = MENTION_PATTERN.exec(textBefore);
  if (match === null) {
    return null;
  }
  const query = match[1] ?? '';
  return { from: $from.pos - query.length - 1, to: $from.pos, query };
};

const isSameQuery = (left: MentionQuery | null, right: MentionQuery | null): boolean =>
  left !== null && right !== null && left.from === right.from && left.query === right.query;

const activeIndexOf = (
  previous: MentionDesk,
  query: MentionQuery | null,
  mentionables: readonly NewsMentionable[],
  meta: MentionDeskMeta | undefined,
): number => {
  if (query === null || !isSameQuery(previous.query, query)) {
    return 0;
  }
  const count = mentionChoicesOf(mentionables, query.query).length;
  if (meta?.kind === 'step') {
    return steppedIndexOf(previous.activeIndex, count, meta.step);
  }
  return Math.max(0, Math.min(previous.activeIndex, count - 1));
};

const editedAtOf = (
  previous: MentionDesk,
  transaction: Transaction,
  next: EditorState,
  meta: MentionDeskMeta | undefined,
): number | null => {
  if (meta?.kind === 'edit') {
    return meta.pos;
  }
  if (previous.editedAt === null) {
    return null;
  }
  const mapped = transaction.mapping.mapResult(previous.editedAt, 1);
  return mapped.deleted || !isMentionNode(next.doc.nodeAt(mapped.pos)) ? null : mapped.pos;
};

const nextDeskOf = (
  transaction: Transaction,
  previous: MentionDesk,
  next: EditorState,
): MentionDesk => {
  const meta: MentionDeskMeta | undefined = transaction.getMeta(mentionDeskKey);
  const mentionables = meta?.kind === 'offer' ? meta.mentionables : previous.mentionables;
  const found = queryAt(next);
  const dismissedAt =
    found === null ? null : meta?.kind === 'dismiss' ? found.from : previous.dismissedAt;
  const query = found === null || found.from === dismissedAt ? null : found;
  return {
    mentionables,
    query,
    dismissedAt,
    activeIndex: activeIndexOf(previous, query, mentionables, meta),
    editedAt: editedAtOf(previous, transaction, next, meta),
  };
};

export const mentionDeskPlugin = new Plugin<MentionDesk>({
  key: mentionDeskKey,
  state: {
    init: () => EMPTY_DESK,
    apply: (transaction, previous, _, next) => nextDeskOf(transaction, previous, next),
  },
});

const deskIn = (state: EditorState): MentionDesk => mentionDeskKey.getState(state) ?? EMPTY_DESK;

export const withMentionDeskMeta = (transaction: Transaction, meta: MentionDeskMeta): Transaction =>
  transaction.setMeta(mentionDeskKey, meta).setMeta('addToHistory', false);

export const mentionablesIn = (state: EditorState): readonly NewsMentionable[] =>
  deskIn(state).mentionables;

export const mentionPickerIn = (state: EditorState): MentionPicker | null => {
  const { query, mentionables, activeIndex } = deskIn(state);
  if (query === null) {
    return null;
  }
  const choices = mentionChoicesOf(mentionables, query.query);
  return { ...query, choices, active: choices[activeIndex] ?? null };
};

export const editedMentionIn = (state: EditorState): EditedMention | null => {
  const pos = deskIn(state).editedAt;
  const node = pos === null ? null : state.doc.nodeAt(pos);
  if (pos === null || node === null || !isMentionNode(node)) {
    return null;
  }
  const mention = mentionOf(node);
  return { pos, id: newsMentionKeyOf(mention), label: mention.label };
};
