export type NewsMentionKind = 'group' | 'person';

export interface NewsMention {
  kind: NewsMentionKind;
  id: number;
  label: string;
}

export type NewsInline =
  | { kind: 'text'; text: string; bold: boolean; href: string | null }
  | { kind: 'mention'; mention: NewsMention; bold: boolean };

export type NewsBlock =
  | { kind: 'paragraph'; inlines: NewsInline[] }
  | { kind: 'heading'; inlines: NewsInline[] }
  | { kind: 'list'; items: NewsInline[][] };
