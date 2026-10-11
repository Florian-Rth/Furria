import type { Transaction } from 'prosemirror-state';
import { EditorState } from 'prosemirror-state';
import type { NewsMentionable } from '../types';
import type { NewsTextCommand, NewsTextFormat } from './news-text-commands';
import { commandOf, formatOf } from './news-text-commands';
import { hasFocusIn, linkRequestsIn, liveTextIn, withTextDeskMeta } from './news-text-desk';
import {
  editedMentionIn,
  mentionablesIn,
  mentionPickerIn,
  withMentionDeskMeta,
} from './news-text-mentions';
import { newsTextPlugins } from './news-text-plugins';
import { newsDocOf, newsTextOfDoc } from './news-text-schema';

export type NewsTextState = EditorState;

export interface NewsTextSettings {
  mentionables: readonly NewsMentionable[];
  liveText: string | null;
}

export interface NewsTextMentionPicker {
  choices: readonly NewsMentionable[];
  activeId: string | null;
}

export interface NewsTextMention {
  id: string;
  label: string;
}

export interface NewsTextView {
  format: NewsTextFormat;
  hasFocus: boolean;
  linkRequests: number;
  picker: NewsTextMentionPicker | null;
  editedMention: NewsTextMention | null;
}

export const openNewsText = (text: string): NewsTextState =>
  EditorState.create({ doc: newsDocOf(text), plugins: [...newsTextPlugins] });

export const newsTextOf = (state: NewsTextState): string => newsTextOfDoc(state.doc);

export const settingsTransactionOf = (
  state: NewsTextState,
  settings: NewsTextSettings,
): Transaction | null => {
  const offersMentionables = mentionablesIn(state) !== settings.mentionables;
  const comparesLive = liveTextIn(state) !== settings.liveText;
  if (!offersMentionables && !comparesLive) {
    return null;
  }
  const offered = offersMentionables
    ? withMentionDeskMeta(state.tr, { kind: 'offer', mentionables: settings.mentionables })
    : state.tr;
  return comparesLive
    ? withTextDeskMeta(offered, { kind: 'live', liveText: settings.liveText })
    : offered;
};

export const settleNewsText = (state: NewsTextState, settings: NewsTextSettings): NewsTextState => {
  const transaction = settingsTransactionOf(state, settings);
  return transaction === null ? state : state.apply(transaction);
};

export const reopenNewsText = (previous: NewsTextState, text: string): NewsTextState => {
  const reopened = settleNewsText(openNewsText(text), {
    mentionables: mentionablesIn(previous),
    liveText: liveTextIn(previous),
  });
  return hasFocusIn(previous)
    ? reopened.apply(withTextDeskMeta(reopened.tr, { kind: 'focus', hasFocus: true }))
    : reopened;
};

export const editNewsText = (
  state: NewsTextState,
  command: NewsTextCommand,
): NewsTextState | null => {
  let next: NewsTextState | null = null;
  const applies = commandOf(command)(state, (transaction) => {
    next = state.apply(transaction);
  });
  return applies ? (next ?? state) : null;
};

export const newsTextViewOf = (state: NewsTextState): NewsTextView => {
  const picker = mentionPickerIn(state);
  const edited = editedMentionIn(state);
  return {
    format: formatOf(state),
    hasFocus: hasFocusIn(state),
    linkRequests: linkRequestsIn(state),
    picker:
      picker === null ? null : { choices: picker.choices, activeId: picker.active?.id ?? null },
    editedMention: edited === null ? null : { id: edited.id, label: edited.label },
  };
};
