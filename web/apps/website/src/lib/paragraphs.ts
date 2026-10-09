const PARAGRAPH_BREAK = /\n\s*\n/;

export const toParagraphs = (text: string | null): string[] | null => {
  const paragraphs = (text ?? '')
    .split(PARAGRAPH_BREAK)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  return paragraphs.length === 0 ? null : paragraphs;
};
