import { isWebAddress } from '@furria/ui/news-text';
import { setBlockType, toggleMark } from 'prosemirror-commands';
import type { ResolvedPos } from 'prosemirror-model';
import { Fragment } from 'prosemirror-model';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import type { Command, EditorState } from 'prosemirror-state';
import { TextSelection } from 'prosemirror-state';
import { withTextDeskMeta } from './news-text-desk';
import type { MentionStep } from './news-text-mentions';
import { editedMentionIn, mentionPickerIn, withMentionDeskMeta } from './news-text-mentions';
import { marks, newsTextSchema, nodes } from './news-text-schema';

export type NewsTextBlockKind = 'paragraph' | 'heading' | 'list';

export interface NewsTextFormat {
  block: NewsTextBlockKind;
  bold: boolean;
  link: string | null;
}

export type NewsTextCommand =
  | { kind: NewsTextBlockKind }
  | { kind: 'bold' }
  | { kind: 'type'; text: string }
  | { kind: 'link'; href: string }
  | { kind: 'unlink' }
  | { kind: 'request-link' }
  | { kind: 'start-mention' }
  | { kind: 'step-mention'; step: MentionStep }
  | { kind: 'choose-mention'; id: string }
  | { kind: 'dismiss-mention' }
  | { kind: 'relabel-mention'; label: string }
  | { kind: 'remove-mention' }
  | { kind: 'close-mention' };

const isInList = ($from: ResolvedPos): boolean => {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type === nodes.list_item) {
      return true;
    }
  }
  return false;
};

const blockKindOf = ($from: ResolvedPos): NewsTextBlockKind => {
  if (isInList($from)) {
    return 'list';
  }
  return $from.parent.type === nodes.heading ? 'heading' : 'paragraph';
};

export const formatOf = (state: EditorState): NewsTextFormat => {
  const { $from, from, to, empty } = state.selection;
  const activeMarks = empty ? (state.storedMarks ?? $from.marks()) : $from.marks();
  const bold = empty
    ? activeMarks.some((mark) => mark.type === marks.strong)
    : state.doc.rangeHasMark(from, to, marks.strong);
  const link = activeMarks.find((mark) => mark.type === marks.link);
  return {
    block: blockKindOf($from),
    bold,
    link: link === undefined ? null : String(link.attrs.href),
  };
};

const setParagraph: Command = (state, dispatch, view) => {
  if (isInList(state.selection.$from)) {
    return liftListItem(nodes.list_item)(state, dispatch, view);
  }
  return setBlockType(nodes.paragraph)(state, dispatch, view);
};

const toggleHeading: Command = (state, dispatch, view) => {
  const block = blockKindOf(state.selection.$from);
  if (block === 'heading') {
    return setBlockType(nodes.paragraph)(state, dispatch, view);
  }
  return block === 'list' ? false : setBlockType(nodes.heading)(state, dispatch, view);
};

const toggleList: Command = (state, dispatch, view) => {
  const block = blockKindOf(state.selection.$from);
  if (block === 'list') {
    return liftListItem(nodes.list_item)(state, dispatch, view);
  }
  return block === 'heading' ? false : wrapInList(nodes.bullet_list)(state, dispatch, view);
};

export const toggleBold: Command = toggleMark(marks.strong);

const typeText =
  (text: string): Command =>
  (state, dispatch) => {
    dispatch?.(state.tr.insertText(text).scrollIntoView());
    return text.length > 0;
  };

const link =
  (href: string): Command =>
  (state, dispatch) => {
    if (!isWebAddress(href)) {
      return false;
    }
    const { from, to, empty } = state.selection;
    const mark = marks.link.create({ href });
    const transaction = empty
      ? state.tr.insert(from, newsTextSchema.text(href, [mark]))
      : state.tr.removeMark(from, to, marks.link).addMark(from, to, mark);
    dispatch?.(transaction.scrollIntoView());
    return true;
  };

const unlink: Command = (state, dispatch) => {
  const { $from, from, to, empty } = state.selection;
  if (!empty) {
    dispatch?.(state.tr.removeMark(from, to, marks.link));
    return true;
  }
  const { node, offset } = $from.parent.childAfter($from.parentOffset);
  if (node === null) {
    return false;
  }
  const start = $from.start() + offset;
  dispatch?.(state.tr.removeMark(start, start + node.nodeSize, marks.link));
  return true;
};

export const requestLink: Command = (state, dispatch) => {
  dispatch?.(withTextDeskMeta(state.tr, { kind: 'request-link' }));
  return true;
};

const startMention: Command = (state, dispatch) => {
  const { from } = state.selection;
  const before = state.doc.textBetween(Math.max(0, from - 1), from);
  const prefix = before.length === 0 || before === ' ' ? '@' : ' @';
  dispatch?.(state.tr.insertText(prefix).scrollIntoView());
  return true;
};

const stepMention =
  (step: MentionStep): Command =>
  (state, dispatch) => {
    if (mentionPickerIn(state) === null) {
      return false;
    }
    dispatch?.(withMentionDeskMeta(state.tr, { kind: 'step', step }));
    return true;
  };

export const chooseMention =
  (id: string): Command =>
  (state, dispatch) => {
    const picker = mentionPickerIn(state);
    const choice = picker?.choices.find((candidate) => candidate.id === id) ?? null;
    if (picker === null || choice === null) {
      return false;
    }
    const mention = nodes.mention.create({
      kind: choice.kind,
      id: choice.targetId,
      label: choice.name,
    });
    dispatch?.(
      state.tr
        .replaceWith(picker.from, picker.to, Fragment.from([mention, newsTextSchema.text(' ')]))
        .scrollIntoView(),
    );
    return true;
  };

export const dismissMention: Command = (state, dispatch) => {
  if (mentionPickerIn(state) === null) {
    return false;
  }
  dispatch?.(withMentionDeskMeta(state.tr, { kind: 'dismiss' }));
  return true;
};

export const editMentionAt =
  (pos: number): Command =>
  (state, dispatch) => {
    dispatch?.(withMentionDeskMeta(state.tr, { kind: 'edit', pos }));
    return true;
  };

const relabelMention =
  (label: string): Command =>
  (state, dispatch) => {
    const edited = editedMentionIn(state);
    if (edited === null || label.trim().length === 0) {
      return false;
    }
    const node = state.doc.nodeAt(edited.pos);
    dispatch?.(state.tr.setNodeMarkup(edited.pos, null, { ...node?.attrs, label }));
    return true;
  };

const removeMention: Command = (state, dispatch) => {
  const edited = editedMentionIn(state);
  const node = edited === null ? null : state.doc.nodeAt(edited.pos);
  if (edited === null || node === null) {
    return false;
  }
  dispatch?.(state.tr.delete(edited.pos, edited.pos + node.nodeSize));
  return true;
};

const closeMention: Command = (state, dispatch) => {
  const edited = editedMentionIn(state);
  const node = edited === null ? null : state.doc.nodeAt(edited.pos);
  if (edited === null || node === null) {
    return false;
  }
  const caret = TextSelection.create(state.doc, edited.pos + node.nodeSize);
  dispatch?.(withMentionDeskMeta(state.tr.setSelection(caret), { kind: 'edit', pos: null }));
  return true;
};

export const commandOf = (command: NewsTextCommand): Command => {
  switch (command.kind) {
    case 'paragraph':
      return setParagraph;
    case 'heading':
      return toggleHeading;
    case 'list':
      return toggleList;
    case 'bold':
      return toggleBold;
    case 'type':
      return typeText(command.text);
    case 'link':
      return link(command.href);
    case 'unlink':
      return unlink;
    case 'request-link':
      return requestLink;
    case 'start-mention':
      return startMention;
    case 'step-mention':
      return stepMention(command.step);
    case 'choose-mention':
      return chooseMention(command.id);
    case 'dismiss-mention':
      return dismissMention;
    case 'relabel-mention':
      return relabelMention(command.label);
    case 'remove-mention':
      return removeMention;
    case 'close-mention':
      return closeMention;
  }
};
