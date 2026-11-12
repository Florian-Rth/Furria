import { readRichText } from './read-rich-text';
import type { MentionKind, RichTextInline } from './rich-text-model';

const plainOf = (inlines: readonly RichTextInline[]): string =>
  inlines
    .map((inline) => (inline.kind === 'mention' ? inline.mention.label : inline.text))
    .join('');

export const plainTextOf = (text: string, kinds: readonly MentionKind[]): string =>
  readRichText(text, kinds)
    .flatMap((block) => (block.kind === 'list' ? block.items : [block.inlines]))
    .map(plainOf)
    .join(' ');
