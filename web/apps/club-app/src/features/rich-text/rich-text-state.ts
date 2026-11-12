import type { MentionKind } from '@furria/ui/rich-text';
import type { Transaction } from 'prosemirror-state';
import { EditorState } from 'prosemirror-state';
import type { RichTextCommand, RichTextFormat } from './rich-text-commands';
import { commandOf, formatOf } from './rich-text-commands';
import type { RichTextLive } from './rich-text-desk';
import { hasFocusIn, linkRequestsIn, liveIn, withTextDeskMeta } from './rich-text-desk';
import { hostPluginOf, mentionKindsIn } from './rich-text-host';
import {
  editedMentionIn,
  mentionablesIn,
  mentionPickerIn,
  withMentionDeskMeta,
} from './rich-text-mentions';
import { richTextPlugins } from './rich-text-plugins';
import { richTextDocOf, richTextOfDoc } from './rich-text-schema';
import type { Mentionable } from './types';

export type RichTextState = EditorState;

export interface RichTextSettings extends RichTextLive {
  mentionables: readonly Mentionable[];
}

export interface RichTextMentionPicker {
  choices: readonly Mentionable[];
  activeId: string | null;
}

export interface RichTextEditedMention {
  id: string;
  label: string;
}

export interface RichTextView {
  format: RichTextFormat;
  hasFocus: boolean;
  linkRequests: number;
  picker: RichTextMentionPicker | null;
  editedMention: RichTextEditedMention | null;
}

export const openRichText = (text: string, kinds: readonly MentionKind[]): RichTextState =>
  EditorState.create({
    doc: richTextDocOf(text, kinds),
    plugins: [...richTextPlugins, hostPluginOf(kinds)],
  });

export const richTextOf = (state: RichTextState): string => richTextOfDoc(state.doc);

export const settingsTransactionOf = (
  state: RichTextState,
  settings: RichTextSettings,
): Transaction | null => {
  const offersMentionables = mentionablesIn(state) !== settings.mentionables;
  const live = liveIn(state);
  const comparesLive =
    live.liveText !== settings.liveText || live.changedMark !== settings.changedMark;
  if (!offersMentionables && !comparesLive) {
    return null;
  }
  const offered = offersMentionables
    ? withMentionDeskMeta(state.tr, { kind: 'offer', mentionables: settings.mentionables })
    : state.tr;
  return comparesLive
    ? withTextDeskMeta(offered, {
        kind: 'live',
        liveText: settings.liveText,
        changedMark: settings.changedMark,
      })
    : offered;
};

export const settleRichText = (state: RichTextState, settings: RichTextSettings): RichTextState => {
  const transaction = settingsTransactionOf(state, settings);
  return transaction === null ? state : state.apply(transaction);
};

export const reopenRichText = (previous: RichTextState, text: string): RichTextState => {
  const reopened = settleRichText(openRichText(text, mentionKindsIn(previous)), {
    mentionables: mentionablesIn(previous),
    ...liveIn(previous),
  });
  return hasFocusIn(previous)
    ? reopened.apply(withTextDeskMeta(reopened.tr, { kind: 'focus', hasFocus: true }))
    : reopened;
};

export const editRichText = (
  state: RichTextState,
  command: RichTextCommand,
): RichTextState | null => {
  let next: RichTextState | null = null;
  const applies = commandOf(command)(state, (transaction) => {
    next = state.apply(transaction);
  });
  return applies ? (next ?? state) : null;
};

export const richTextViewOf = (state: RichTextState): RichTextView => {
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
