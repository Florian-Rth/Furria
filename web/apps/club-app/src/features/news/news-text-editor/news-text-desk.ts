import type { Node as ProseNode } from 'prosemirror-model';
import type { EditorState, Transaction } from 'prosemirror-state';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { CHANGED_MARK } from '../news-copy';
import { isChangedBlock, textBlocksOf } from '../news-lifecycle';
import { newsBlockTextOf } from './news-text-schema';

interface TextDesk {
  liveText: string | null;
  liveBlocks: ReadonlySet<string> | null;
  hasFocus: boolean;
  linkRequests: number;
}

export type TextDeskMeta =
  | { kind: 'live'; liveText: string | null }
  | { kind: 'focus'; hasFocus: boolean }
  | { kind: 'request-link' };

const textDeskKey = new PluginKey<TextDesk>('news-text-desk');

const EMPTY_DESK: TextDesk = { liveText: null, liveBlocks: null, hasFocus: false, linkRequests: 0 };

const nextDeskOf = (meta: TextDeskMeta | undefined, previous: TextDesk): TextDesk => {
  if (meta?.kind === 'live') {
    return {
      ...previous,
      liveText: meta.liveText,
      liveBlocks: meta.liveText === null ? null : new Set(textBlocksOf(meta.liveText)),
    };
  }
  if (meta?.kind === 'focus') {
    return { ...previous, hasFocus: meta.hasFocus };
  }
  if (meta?.kind === 'request-link') {
    return { ...previous, linkRequests: previous.linkRequests + 1 };
  }
  return previous;
};

const deskIn = (state: EditorState): TextDesk => textDeskKey.getState(state) ?? EMPTY_DESK;

const changedBlocksOf = (state: EditorState): DecorationSet => {
  const { liveBlocks } = deskIn(state);
  if (liveBlocks === null) {
    return DecorationSet.empty;
  }
  const decorations: Decoration[] = [];
  state.doc.forEach((node: ProseNode, offset: number) => {
    if (isChangedBlock(newsBlockTextOf(node), liveBlocks)) {
      decorations.push(
        Decoration.node(offset, offset + node.nodeSize, { 'data-kk-changed': CHANGED_MARK }),
      );
    }
  });
  return DecorationSet.create(state.doc, decorations);
};

export const textDeskPlugin = new Plugin<TextDesk>({
  key: textDeskKey,
  state: {
    init: () => EMPTY_DESK,
    apply: (transaction, previous) => nextDeskOf(transaction.getMeta(textDeskKey), previous),
  },
  props: { decorations: changedBlocksOf },
});

export const withTextDeskMeta = (transaction: Transaction, meta: TextDeskMeta): Transaction =>
  transaction.setMeta(textDeskKey, meta).setMeta('addToHistory', false);

export const liveTextIn = (state: EditorState): string | null => deskIn(state).liveText;

export const hasFocusIn = (state: EditorState): boolean => deskIn(state).hasFocus;

export const linkRequestsIn = (state: EditorState): number => deskIn(state).linkRequests;
