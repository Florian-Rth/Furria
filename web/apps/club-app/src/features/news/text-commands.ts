import { isWebAddress } from '@furria/ui/news-text';
import { baseKeymap, setBlockType, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import {
  InputRule,
  inputRules,
  textblockTypeInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import type { Node as ProseNode, ResolvedPos } from 'prosemirror-model';
import { Fragment, Slice } from 'prosemirror-model';
import { liftListItem, splitListItem, wrapInList } from 'prosemirror-schema-list';
import type { Command, EditorState, Transaction } from 'prosemirror-state';
import { NodeSelection, Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { newsBlockTextOf, newsDocOf, newsMentionKeyOf, newsTextSchema } from '@/lib/news-prose';
import { isChangedBlock } from './news-lifecycle';
import type { NewsMentionable } from './types';

const { nodes, marks } = newsTextSchema;
const MENTION_LOOKBACK = 32;
const MENTION_PATTERN = /(?:^|\s)@([\p{L}\d-]*)$/u;
const OBJECT_REPLACEMENT = '￼';

export type TextBlockKind = 'paragraph' | 'heading' | 'list';

export interface TextFormat {
  block: TextBlockKind;
  bold: boolean;
  link: string | null;
}

export interface MentionQuery {
  from: number;
  to: number;
  query: string;
}

export interface SelectedMention {
  pos: number;
  label: string;
  id: string;
}

export const mentionQueryOf = (textBefore: string): string | null => {
  const match = MENTION_PATTERN.exec(textBefore);
  return match === null ? null : (match[1] ?? '');
};

export const matchesMention = (mentionable: NewsMentionable, query: string): boolean => {
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

const isInList = ($from: ResolvedPos): boolean => {
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type === nodes.list_item) {
      return true;
    }
  }
  return false;
};

export const formatOf = (state: EditorState): TextFormat => {
  const { $from, from, to, empty } = state.selection;
  const block: TextBlockKind = isInList($from)
    ? 'list'
    : $from.parent.type === nodes.heading
      ? 'heading'
      : 'paragraph';
  const activeMarks = empty ? (state.storedMarks ?? $from.marks()) : $from.marks();
  const bold = empty
    ? activeMarks.some((mark) => mark.type === marks.strong)
    : state.doc.rangeHasMark(from, to, marks.strong);
  const link = activeMarks.find((mark) => mark.type === marks.link);
  return { block, bold, link: link === undefined ? null : String(link.attrs.href) };
};

const liftOutOfList: Command = (state, dispatch) =>
  isInList(state.selection.$from) ? liftListItem(nodes.list_item)(state, dispatch) : false;

export const setParagraph: Command = (state, dispatch, view) => {
  if (liftOutOfList(state, dispatch, view)) {
    return true;
  }
  return setBlockType(nodes.paragraph)(state, dispatch, view);
};

export const toggleHeading: Command = (state, dispatch, view) => {
  if (formatOf(state).block === 'heading') {
    return setBlockType(nodes.paragraph)(state, dispatch, view);
  }
  if (isInList(state.selection.$from)) {
    return false;
  }
  return setBlockType(nodes.heading)(state, dispatch, view);
};

export const toggleList: Command = (state, dispatch, view) => {
  if (isInList(state.selection.$from)) {
    return liftListItem(nodes.list_item)(state, dispatch, view);
  }
  if (state.selection.$from.parent.type === nodes.heading) {
    return false;
  }
  return wrapInList(nodes.bullet_list)(state, dispatch, view);
};

export const toggleBold: Command = toggleMark(marks.strong);

export const linkCommand =
  (href: string): Command =>
  (state, dispatch) => {
    if (!isWebAddress(href)) {
      return false;
    }
    const { from, to, empty } = state.selection;
    if (dispatch !== undefined) {
      const mark = marks.link.create({ href });
      const transaction = empty
        ? state.tr.insert(from, newsTextSchema.text(href, [mark]))
        : state.tr.removeMark(from, to, marks.link).addMark(from, to, mark);
      dispatch(transaction.scrollIntoView());
    }
    return true;
  };

export const unlinkCommand: Command = (state, dispatch) => {
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

export const insertMentionCommand =
  (range: Pick<MentionQuery, 'from' | 'to'>, mentionable: NewsMentionable): Command =>
  (state, dispatch) => {
    if (dispatch !== undefined) {
      const node = nodes.mention.create({
        kind: mentionable.kind,
        id: mentionable.targetId,
        label: mentionable.name,
      });
      dispatch(
        state.tr
          .replaceWith(range.from, range.to, Fragment.from([node, newsTextSchema.text(' ')]))
          .scrollIntoView(),
      );
    }
    return true;
  };

export const relabelMentionCommand =
  (pos: number, label: string): Command =>
  (state, dispatch) => {
    const node = state.doc.nodeAt(pos);
    if (node === null || node.type !== nodes.mention || label.trim().length === 0) {
      return false;
    }
    if (dispatch !== undefined) {
      dispatch(state.tr.setNodeMarkup(pos, null, { ...node.attrs, label }));
    }
    return true;
  };

export const removeMentionCommand =
  (pos: number): Command =>
  (state, dispatch) => {
    const node = state.doc.nodeAt(pos);
    if (node === null || node.type !== nodes.mention) {
      return false;
    }
    if (dispatch !== undefined) {
      dispatch(state.tr.delete(pos, pos + node.nodeSize));
    }
    return true;
  };

export const mentionAt = (state: EditorState, pos: number | null): SelectedMention | null => {
  const node = pos === null ? null : state.doc.nodeAt(pos);
  if (pos === null || node === null || node.type !== nodes.mention) {
    return null;
  }
  return {
    pos,
    label: String(node.attrs.label),
    id: newsMentionKeyOf(node.attrs.kind, Number(node.attrs.id)),
  };
};

export const isMentionNode = (node: ProseNode): boolean => node.type === nodes.mention;

export const caretAfterCommand =
  (pos: number): Command =>
  (state, dispatch) => {
    const node = state.doc.nodeAt(pos);
    if (node === null) {
      return false;
    }
    dispatch?.(state.tr.setSelection(TextSelection.create(state.doc, pos + node.nodeSize)));
    return true;
  };

interface MentionPluginState {
  query: MentionQuery | null;
  dismissedAt: number | null;
}

export const mentionKey = new PluginKey<MentionPluginState>('news-mention');

const DISMISS_META = 'news-mention-dismiss';

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
  const query = mentionQueryOf(textBefore);
  if (query === null) {
    return null;
  }
  return { from: $from.pos - query.length - 1, to: $from.pos, query };
};

const mentionPlugin = new Plugin<MentionPluginState>({
  key: mentionKey,
  state: {
    init: () => ({ query: null, dismissedAt: null }),
    apply: (transaction: Transaction, previous: MentionPluginState, _, next: EditorState) => {
      const query = queryAt(next);
      const dismissedAt =
        transaction.getMeta(DISMISS_META) === true ? (query?.from ?? null) : previous.dismissedAt;
      if (query === null || query.from === dismissedAt) {
        return { query: null, dismissedAt: query === null ? null : dismissedAt };
      }
      return { query, dismissedAt };
    },
  },
});

export const dismissMentionCommand: Command = (state, dispatch) => {
  if (mentionKey.getState(state)?.query === null) {
    return false;
  }
  if (dispatch !== undefined) {
    dispatch(state.tr.setMeta(DISMISS_META, true));
  }
  return true;
};

export const mentionQueryIn = (state: EditorState): MentionQuery | null =>
  mentionKey.getState(state)?.query ?? null;

const boldRule = new InputRule(/\*\*([^*]+)\*\*$/, (state, match, start, end) => {
  const [, inner] = match;
  if (inner === undefined) {
    return null;
  }
  return state.tr
    .replaceWith(start, end, newsTextSchema.text(inner, [marks.strong.create()]))
    .removeStoredMark(marks.strong);
});

const pastePlugin = new Plugin({
  props: {
    clipboardTextParser: (text) => {
      const doc = newsDocOf(text.replace(/\r\n?/g, '\n'));
      return new Slice(doc.content, 1, 1);
    },
  },
});

export interface ChangedBlocksState {
  liveBlocks: ReadonlySet<string> | null;
  label: string;
}

export const changedKey = new PluginKey<ChangedBlocksState>('news-changed');

const changedPlugin = new Plugin<ChangedBlocksState>({
  key: changedKey,
  state: {
    init: () => ({ liveBlocks: null, label: '' }),
    apply: (transaction, previous) => {
      const next: ChangedBlocksState | undefined = transaction.getMeta(changedKey);
      return next ?? previous;
    },
  },
  props: {
    decorations: (state) => {
      const changed = changedKey.getState(state);
      const liveBlocks = changed?.liveBlocks ?? null;
      if (changed === undefined || liveBlocks === null) {
        return DecorationSet.empty;
      }
      const decorations: Decoration[] = [];
      state.doc.forEach((node: ProseNode, offset: number) => {
        if (isChangedBlock(newsBlockTextOf(node), liveBlocks)) {
          decorations.push(
            Decoration.node(offset, offset + node.nodeSize, {
              'data-kk-changed': changed.label,
            }),
          );
        }
      });
      return DecorationSet.create(state.doc, decorations);
    },
  },
});

export const markChangedBlocks = (view: EditorView, changed: ChangedBlocksState): void => {
  view.dispatch(view.state.tr.setMeta(changedKey, changed).setMeta('addToHistory', false));
};

export type PickerKey = 'next' | 'previous' | 'choose';

export interface TextKeyHandlers {
  onLinkRequest: () => void;
  onPickerKey: (key: PickerKey) => boolean;
  onMentionClick: (pos: number) => void;
}

const PICKER_KEYS: Record<string, PickerKey> = {
  ArrowDown: 'next',
  ArrowUp: 'previous',
  Enter: 'choose',
  Tab: 'choose',
};

const selectedMentionPosOf = (state: EditorState): number | null => {
  const { selection } = state;
  return selection instanceof NodeSelection && isMentionNode(selection.node)
    ? selection.from
    : null;
};

const pickerKeysOf = (handlers: TextKeyHandlers): Plugin =>
  new Plugin({
    props: {
      handleClickOn: (_, pos, node) => {
        if (!isMentionNode(node)) {
          return false;
        }
        handlers.onMentionClick(pos);
        return false;
      },
      handleKeyDown: (view, event) => {
        const selected = selectedMentionPosOf(view.state);
        if (event.key === 'Enter' && selected !== null) {
          handlers.onMentionClick(selected);
          return true;
        }
        const key = PICKER_KEYS[event.key];
        if (key === undefined || mentionQueryIn(view.state) === null) {
          return false;
        }
        return handlers.onPickerKey(key);
      },
    },
  });

export const textPluginsOf = (handlers: TextKeyHandlers): Plugin[] => [
  pickerKeysOf(handlers),
  mentionPlugin,
  changedPlugin,
  pastePlugin,
  history(),
  inputRules({
    rules: [
      textblockTypeInputRule(/^##\s$/, nodes.heading),
      wrappingInputRule(/^\s*[-*]\s$/, nodes.bullet_list),
      boldRule,
    ],
  }),
  keymap({
    'Mod-z': undo,
    'Shift-Mod-z': redo,
    'Mod-y': redo,
    'Mod-b': toggleBold,
    'Mod-k': () => {
      handlers.onLinkRequest();
      return true;
    },
    Enter: splitListItem(nodes.list_item),
    Escape: dismissMentionCommand,
    Tab: () => false,
  }),
  keymap(baseKeymap),
];
