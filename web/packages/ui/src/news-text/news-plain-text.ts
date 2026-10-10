import type { NewsInline } from './news-text-model';
import { readNewsText } from './read-news-text';

const plainOf = (inlines: readonly NewsInline[]): string =>
  inlines
    .map((inline) => (inline.kind === 'mention' ? inline.mention.label : inline.text))
    .join('');

export const newsPlainTextOf = (text: string): string =>
  readNewsText(text)
    .flatMap((block) => (block.kind === 'list' ? block.items : [block.inlines]))
    .map(plainOf)
    .join(' ');
