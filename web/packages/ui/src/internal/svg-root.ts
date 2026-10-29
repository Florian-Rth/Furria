const ROOT_TAG = /<svg\b[^>]*>/i;

export interface SvgRootTag {
  tag: string;
  start: number;
}

export const svgRootTagOf = (markup: string): SvgRootTag | null => {
  const match = ROOT_TAG.exec(markup);

  return match === null ? null : { tag: match[0], start: match.index };
};

const attributePattern = (name: string): RegExp =>
  new RegExp(`\\s${name}\\s*=\\s*(["'])([^"']*)\\1`, 'i');

export const svgAttributeOf = (tag: string, name: string): string | null =>
  attributePattern(name).exec(tag)?.[2] ?? null;

export const withoutSvgAttribute = (tag: string, name: string): string =>
  tag.replace(attributePattern(name), '');
