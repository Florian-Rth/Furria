import type { RichTextBlockKind } from './rich-text-commands';

export const NEW_TAB_NOTE = 'öffnet in neuem Tab';

export const FORMAT_RAIL_LABEL = 'Format';
export const BLOCK_WORDS: Record<RichTextBlockKind, string> = {
  paragraph: 'Absatz',
  heading: 'Zwischenüberschrift',
  list: 'Liste',
};
export const BOLD_WORD = 'Fett';
export const LINK_WORD = 'Link';
export const MENTION_WORD = 'Erwähnen';

export const LINK_SHEET_TITLE = 'Link setzen';
export const LINK_FIELD = 'Adresse (https://…)';
export const LINK_APPLY = 'Link setzen';
export const LINK_REMOVE = 'Link entfernen';
export const LINK_INVALID = 'Nur Adressen mit https:// oder http://';
export const LINK_SHEET_CLOSE = 'Schließen';

export const MENTION_LABEL_FIELD = 'So steht es im Satz';
export const MENTION_TARGET = 'Verweist auf';
export const MENTION_REMOVE = 'Erwähnung entfernen';
export const MENTION_DONE = 'Fertig';

export const MENTION_CARD_LABELS = {
  groupCta: 'Zur Gruppe →',
  personCta: 'Zur Person →',
} as const;
