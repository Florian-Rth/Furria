import { baseKeymap } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import {
  InputRule,
  inputRules,
  textblockTypeInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Slice } from 'prosemirror-model';
import { splitListItem } from 'prosemirror-schema-list';
import type { Command, EditorState } from 'prosemirror-state';
import { NodeSelection, Plugin } from 'prosemirror-state';
import {
  chooseMention,
  commandOf,
  dismissMention,
  editMentionAt,
  requestLink,
  toggleBold,
} from './news-text-commands';
import { textDeskPlugin, withTextDeskMeta } from './news-text-desk';
import { mentionDeskPlugin, mentionPickerIn } from './news-text-mentions';
import { isMentionNode, marks, newsDocOf, newsTextSchema, nodes } from './news-text-schema';

const LINE_ENDINGS = /\r\n?/g;

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
    clipboardTextParser: (text) =>
      new Slice(newsDocOf(text.replace(LINE_ENDINGS, '\n')).content, 1, 1),
  },
});

const selectedMentionPosOf = (state: EditorState): number | null => {
  const { selection } = state;
  return selection instanceof NodeSelection && isMentionNode(selection.node)
    ? selection.from
    : null;
};

const chooseActiveMention: Command = (state, dispatch, view) => {
  const active = mentionPickerIn(state)?.active ?? null;
  return active === null ? false : chooseMention(active.id)(state, dispatch, view);
};

const editSelectedMention: Command = (state, dispatch, view) => {
  const pos = selectedMentionPosOf(state);
  return pos === null ? false : editMentionAt(pos)(state, dispatch, view);
};

const pickerKeymap = keymap({
  ArrowDown: commandOf({ kind: 'step-mention', step: 'next' }),
  ArrowUp: commandOf({ kind: 'step-mention', step: 'previous' }),
  Enter: (state, dispatch, view) =>
    editSelectedMention(state, dispatch, view) ||
    (mentionPickerIn(state) !== null && chooseActiveMention(state, dispatch, view)),
  Tab: (state, dispatch, view) =>
    mentionPickerIn(state) !== null && chooseActiveMention(state, dispatch, view),
  Escape: dismissMention,
});

const pointerPlugin = new Plugin({
  props: {
    handleClickOn: (view, pos, node) => {
      if (isMentionNode(node)) {
        editMentionAt(pos)(view.state, view.dispatch, view);
      }
      return false;
    },
    handleDOMEvents: {
      focus: (view) => {
        view.dispatch(withTextDeskMeta(view.state.tr, { kind: 'focus', hasFocus: true }));
        return false;
      },
      blur: (view) => {
        view.dispatch(withTextDeskMeta(view.state.tr, { kind: 'focus', hasFocus: false }));
        return false;
      },
    },
  },
});

export const newsTextPlugins: readonly Plugin[] = [
  pickerKeymap,
  pointerPlugin,
  mentionDeskPlugin,
  textDeskPlugin,
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
    'Mod-k': requestLink,
    Enter: splitListItem(nodes.list_item),
    Tab: () => false,
  }),
  keymap(baseKeymap),
];
