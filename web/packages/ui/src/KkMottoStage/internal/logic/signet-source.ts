const SVG_DATA_PREFIX = 'data:image/svg+xml;charset=utf-8,';

export const signetSourceOf = (signetSvg: string | null): string | null => {
  const markup = signetSvg === null ? '' : signetSvg.trim();

  if (markup === '') {
    return null;
  }

  return `${SVG_DATA_PREFIX}${encodeURIComponent(markup)}`;
};
