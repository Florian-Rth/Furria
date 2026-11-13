export const MENTION_KINDS = [
  'group',
  'person',
  'calendar-entry',
  'event',
  'news-post',
  'album',
] as const;

export type MentionKind = (typeof MENTION_KINDS)[number];

export interface TextMention {
  kind: MentionKind;
  id: number;
  label: string;
}

export type RichTextInline =
  | { kind: 'text'; text: string; bold: boolean; href: string | null }
  | { kind: 'mention'; mention: TextMention; bold: boolean };

export type RichTextBlock =
  | { kind: 'paragraph'; inlines: RichTextInline[] }
  | { kind: 'heading'; inlines: RichTextInline[] }
  | { kind: 'list'; items: RichTextInline[][] };
