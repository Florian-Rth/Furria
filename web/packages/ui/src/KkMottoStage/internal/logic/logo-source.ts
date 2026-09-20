const SVG_DATA_PREFIX = 'data:image/svg+xml;charset=utf-8,';

export const logoSourceOf = (logoSvg: string | null): string | null => {
  const markup = logoSvg === null ? '' : logoSvg.trim();

  if (markup === '') {
    return null;
  }

  return `${SVG_DATA_PREFIX}${encodeURIComponent(markup)}`;
};
