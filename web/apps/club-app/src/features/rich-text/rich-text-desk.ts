import type { Node as ProseNode } from 'prosemirror-model';
import type { EditorState, Transaction } from 'prosemirror-state';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { isChangedBlock, textBlocksOf } from './rich-text-blocks';
import { richTextBlockTextOf } from './rich-text-schema';

export interface RichTextLive {
  liveText: string | null;
  changedMark: string;
}

interface TextDesk extends RichTextLive {
  liveBlocks: ReadonlySet<string> | null;
  hasFocus: boolean;
  linkRequests: number;
}

export type TextDeskMeta =
  | ({ kind: 'live' } & RichTextLive)
  | { kind: 'focus'; hasFocus: boolean }
  | { kind: 'request-link' };

const textDeskKey = new PluginKey<TextDesk>('rich-text-desk');

const EMPTY_DESK: TextDesk = {
  liveText: null,
  changedMark: '',
  liveBlocks: null,
  hasFocus: false,
  linkRequests: 0,
};

const nextDeskOf = (meta: TextDeskMeta | undefined, previous: TextDesk): TextDesk => {
  if (meta?.kind === 'live') {
    return {
      ...previous,
      liveText: meta.liveText,
      changedMark: meta.changedMark,
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
  const { liveBlocks, changedMark } = deskIn(state);
  if (liveBlocks === null) {
    return DecorationSet.empty;
  }
  const decorations: Decoration[] = [];
  state.doc.forEach((node: ProseNode, offset: number) => {
    if (isChangedBlock(richTextBlockTextOf(node), liveBlocks)) {
      decorations.push(
        Decoration.node(offset, offset + node.nodeSize, { 'data-kk-changed': changedMark }),
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

export const liveIn = (state: EditorState): RichTextLive => {
  const { liveText, changedMark } = deskIn(state);
  return { liveText, changedMark };
};

export const hasFocusIn = (state: EditorState): boolean => deskIn(state).hasFocus;

export const linkRequestsIn = (state: EditorState): number => deskIn(state).linkRequests;
