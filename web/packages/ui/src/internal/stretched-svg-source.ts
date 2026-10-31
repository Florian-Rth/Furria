import { svgIntrinsicSizeOf } from '../svg-intrinsic-size';
import { svgAttributeOf, svgRootTagOf, withoutSvgAttribute } from './svg-root';

const SVG_DATA_PREFIX = 'data:image/svg+xml;charset=utf-8,';
const ROOT_OPENING = /^<svg\b/i;
const PRESERVE_ASPECT_RATIO = 'preserveAspectRatio';

const viewBoxAttributeOf = (tag: string, markup: string): string => {
  const size = svgIntrinsicSizeOf(markup);

  if (svgAttributeOf(tag, 'viewBox') !== null || size === null) {
    return '';
  }

  return ` viewBox="0 0 ${size.width} ${size.height}"`;
};

export const stretchedSvgSourceOf = (markup: string | null): string | null => {
  const trimmed = markup === null ? '' : markup.trim();
  const root = svgRootTagOf(trimmed);

  if (root === null) {
    return null;
  }

  const stretchedTag = withoutSvgAttribute(root.tag, PRESERVE_ASPECT_RATIO).replace(
    ROOT_OPENING,
    `<svg ${PRESERVE_ASPECT_RATIO}="none"${viewBoxAttributeOf(root.tag, trimmed)}`,
  );
  const stretched = `${trimmed.slice(0, root.start)}${stretchedTag}${trimmed.slice(root.start + root.tag.length)}`;

  return `${SVG_DATA_PREFIX}${encodeURIComponent(stretched)}`;
};
