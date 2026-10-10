import type { NewsBlock, NewsInline } from './news-text-model';
import {
  BOLD_MARKER,
  HEADING_MARKER,
  ITEM_MARKER,
  isEscapeAt,
  isWebAddress,
  LINE_BREAK,
  mentionTargetOf,
  opensTagAt,
} from './news-text-syntax';

const LABEL_MARKUP = new Set(['*', '`', '[', ']']);

interface Bracket {
  label: string;
  target: string;
  end: number;
}

const closingBracketAfter = (source: string, from: number): number => {
  for (let index = from; index < source.length; index += 1) {
    if (isEscapeAt(source, index)) {
      index += 1;
    } else if (source[index] === '[') {
      return -1;
    } else if (source[index] === ']') {
      return index;
    }
  }
  return -1;
};

const isPlainLabel = (label: string): boolean => {
  if (label.trim().length === 0) {
    return false;
  }
  for (let index = 0; index < label.length; index += 1) {
    if (isEscapeAt(label, index)) {
      index += 1;
    } else if (LABEL_MARKUP.has(label[index] ?? '') || opensTagAt(label, index)) {
      return false;
    }
  }
  return true;
};

const withoutEscapes = (value: string): string => {
  let plain = '';
  for (let index = 0; index < value.length; index += 1) {
    if (isEscapeAt(value, index)) {
      index += 1;
    }
    plain += value[index] ?? '';
  }
  return plain;
};

const bracketAt = (source: string, open: number): Bracket | null => {
  const close = closingBracketAfter(source, open + 1);
  if (close < 0 || source[close + 1] !== '(') {
    return null;
  }
  const end = source.indexOf(')', close + 2);
  if (end < 0) {
    return null;
  }
  const label = source.slice(open + 1, close);
  return isPlainLabel(label)
    ? { label: withoutEscapes(label), target: source.slice(close + 2, end), end: end + 1 }
    : null;
};

const hasClosingBoldAfter = (source: string, from: number): boolean => {
  for (let index = from; index < source.length - 1; index += 1) {
    if (isEscapeAt(source, index)) {
      index += 1;
    } else if (source.startsWith(BOLD_MARKER, index)) {
      return true;
    }
  }
  return false;
};

const appendText = (
  inlines: NewsInline[],
  text: string,
  bold: boolean,
  href: string | null,
): void => {
  const last = inlines.at(-1);
  if (last?.kind === 'text' && last.bold === bold && last.href === href) {
    inlines[inlines.length - 1] = { ...last, text: last.text + text };
  } else {
    inlines.push({ kind: 'text', text, bold, href });
  }
};

interface InlineStep {
  next: number;
  bold: boolean;
}

const stepAt = (
  source: string,
  index: number,
  bold: boolean,
  inlines: NewsInline[],
): InlineStep => {
  if (isEscapeAt(source, index)) {
    appendText(inlines, source[index + 1] ?? '', bold, null);
    return { next: index + 2, bold };
  }
  if (
    source.startsWith(BOLD_MARKER, index) &&
    (bold || hasClosingBoldAfter(source, index + BOLD_MARKER.length))
  ) {
    return { next: index + BOLD_MARKER.length, bold: !bold };
  }
  if (source[index] === '@' && source[index + 1] === '[') {
    const bracket = bracketAt(source, index + 1);
    const target = bracket === null ? null : mentionTargetOf(bracket.target);
    if (bracket !== null && target !== null) {
      inlines.push({ kind: 'mention', mention: { ...target, label: bracket.label }, bold });
      return { next: bracket.end, bold };
    }
  }
  if (source[index] === '[') {
    const bracket = bracketAt(source, index);
    if (bracket !== null && isWebAddress(bracket.target)) {
      appendText(inlines, bracket.label, bold, bracket.target);
      return { next: bracket.end, bold };
    }
  }
  appendText(inlines, source[index] ?? '', bold, null);
  return { next: index + 1, bold };
};

export const readNewsInlines = (source: string): NewsInline[] => {
  const inlines: NewsInline[] = [];
  let step: InlineStep = { next: 0, bold: false };
  while (step.next < source.length) {
    step = stepAt(source, step.next, step.bold, inlines);
  }
  return inlines;
};

export const readNewsText = (text: string): NewsBlock[] => {
  const blocks: NewsBlock[] = [];
  let paragraph: string[] = [];
  let items: string[] = [];

  const closeParagraph = (): void => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', inlines: readNewsInlines(paragraph.join(' ')) });
      paragraph = [];
    }
  };
  const closeList = (): void => {
    if (items.length > 0) {
      blocks.push({ kind: 'list', items: items.map(readNewsInlines) });
      items = [];
    }
  };

  for (const line of text.split(LINE_BREAK)) {
    if (line.trim().length === 0) {
      closeParagraph();
      closeList();
    } else if (line.startsWith(HEADING_MARKER)) {
      closeParagraph();
      closeList();
      blocks.push({ kind: 'heading', inlines: readNewsInlines(line.slice(HEADING_MARKER.length)) });
    } else if (line.startsWith(ITEM_MARKER)) {
      closeParagraph();
      items.push(line.slice(ITEM_MARKER.length));
    } else {
      closeList();
      paragraph.push(line.trim());
    }
  }
  closeParagraph();
  closeList();
  return blocks;
};
