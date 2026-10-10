const HALF_LINE = 0.5;
const NORMAL_LINE_HEIGHT = 1.2;

const lineHeightOf = (style: CSSStyleDeclaration): number => {
  const lineHeight = Number.parseFloat(style.lineHeight);
  return Number.isNaN(lineHeight)
    ? Number.parseFloat(style.fontSize) * NORMAL_LINE_HEIGHT
    : lineHeight;
};

export const isClampOverflowing = (node: Element): boolean => {
  const tolerance = lineHeightOf(getComputedStyle(node)) * HALF_LINE;
  return node.scrollHeight - node.clientHeight > tolerance;
};
