import type { NewsBlock, NewsInline } from './news-text-model';
import {
  BOLD_MARKER,
  HEADING_MARKER,
  ITEM_MARKER,
  isMentionId,
  isWebAddress,
} from './news-text-syntax';

const LAYOUT_WHITESPACE = /[\t\n\r\f\v\u0085\u2028\u2029 ]+/g;
const INLINE_MARKUP = /[\\*[\]`]|<(?=[A-Za-z/!?])/g;
const STRUCTURE_OPENER = /^[#\->+]/;
const RULE_LINE = /^(?:[-*_]\s*){3,}$|^=+\s*$|^~~~/;
const ORDERED_OPENER = /^(\d{1,9})([.)])(?=\s|$)/;
const BRACKET_OPENER_BEFORE = /[!@]$/;
const ADDRESS_PARENTHESIS = /[()]/g;

const escapeMarkup = (text: string): string => text.replace(INLINE_MARKUP, '\\$&');

const escapeAddress = (href: string): string =>
  href.replace(ADDRESS_PARENTHESIS, (parenthesis) => (parenthesis === '(' ? '%28' : '%29'));

const escapeLineOpener = (line: string): string => {
  if (STRUCTURE_OPENER.test(line) || RULE_LINE.test(line)) {
    return `\\${line}`;
  }
  return line.replace(ORDERED_OPENER, '$1\\$2');
};

const tidyInline = (inline: NewsInline): NewsInline | null => {
  if (inline.kind === 'mention') {
    const label = inline.mention.label.replace(LAYOUT_WHITESPACE, ' ').trim();
    if (label.length === 0) {
      return null;
    }
    return isMentionId(inline.mention.id)
      ? { ...inline, mention: { ...inline.mention, label } }
      : { kind: 'text', text: label, bold: inline.bold, href: null };
  }
  const text = inline.text.replace(LAYOUT_WHITESPACE, ' ');
  const isBlank = text.trim().length === 0;
  const href = inline.href !== null && !isBlank && isWebAddress(inline.href) ? inline.href : null;
  return text.length === 0 ? null : { kind: 'text', text, bold: inline.bold && !isBlank, href };
};

const trimmedAt = (text: string, isFirst: boolean, isLast: boolean): string => {
  const start = isFirst ? text.trimStart() : text;
  return isLast ? start.trimEnd() : start;
};

const trimEdges = (inlines: NewsInline[]): NewsInline[] =>
  inlines.map((inline, index) =>
    inline.kind === 'mention'
      ? inline
      : { ...inline, text: trimmedAt(inline.text, index === 0, index === inlines.length - 1) },
  );

const isKept = (inline: NewsInline): boolean => inline.kind === 'mention' || inline.text.length > 0;

const tidyInlines = (inlines: readonly NewsInline[]): NewsInline[] =>
  trimEdges(inlines.map(tidyInline).filter((inline) => inline !== null)).filter(isKept);

const guardBracketOpener = (line: string): string =>
  BRACKET_OPENER_BEFORE.test(line) ? `${line.slice(0, -1)}\\${line.slice(-1)}` : line;

const markupOf = (inline: NewsInline): string => {
  if (inline.kind === 'mention') {
    const { kind, id, label } = inline.mention;
    return `@[${escapeMarkup(label)}](${kind}:${id})`;
  }
  if (inline.href === null) {
    return escapeMarkup(inline.text);
  }
  return `[${escapeMarkup(inline.text)}](${escapeAddress(inline.href)})`;
};

const writeInlines = (inlines: readonly NewsInline[]): string => {
  let line = '';
  let bold = false;
  for (const inline of tidyInlines(inlines)) {
    if (inline.bold !== bold) {
      line += BOLD_MARKER;
      bold = inline.bold;
    }
    const opensLink = inline.kind === 'text' && inline.href !== null;
    line = (opensLink ? guardBracketOpener(line) : line) + markupOf(inline);
  }
  return bold ? `${line}${BOLD_MARKER}` : line;
};

const linesOf = (block: NewsBlock): string[] => {
  if (block.kind === 'list') {
    return block.items
      .map(writeInlines)
      .filter((item) => item.length > 0)
      .map((item) => `${ITEM_MARKER}${item}`);
  }
  const line = writeInlines(block.inlines);
  if (line.length === 0) {
    return [];
  }
  return [block.kind === 'heading' ? `${HEADING_MARKER}${line}` : escapeLineOpener(line)];
};

export const writeNewsText = (blocks: readonly NewsBlock[]): string =>
  blocks
    .map(linesOf)
    .filter((lines) => lines.length > 0)
    .map((lines) => lines.join('\n'))
    .join('\n\n');
