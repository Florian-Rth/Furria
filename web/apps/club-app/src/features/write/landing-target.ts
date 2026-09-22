const SEPARATOR = ':';

export interface LandingTarget {
  kind: string;
  id: string;
}

export const toLandingKey = (kind: string, id: string | number): string =>
  `${kind}${SEPARATOR}${id}`;

export const parseLandingKey = (key: string | undefined): LandingTarget | null => {
  if (key === undefined) {
    return null;
  }

  const separatorIndex = key.indexOf(SEPARATOR);

  if (separatorIndex <= 0 || separatorIndex === key.length - 1) {
    return null;
  }

  return { kind: key.slice(0, separatorIndex), id: key.slice(separatorIndex + 1) };
};
