const SEPARATOR = ':';
const CHANGED_PARAM = 'changed';

export interface LandingMark {
  kind: string;
  id: string | number;
}

export type LandingSearch = Record<string, string | number>;

export interface WriteLanding {
  to: string;
  params?: Record<string, string | number>;
  search?: LandingSearch;
  mark?: LandingMark;
}

export interface LandingNavigation {
  to: string;
  params: Record<string, string>;
  search: LandingSearch | undefined;
}

export const toLandingKey = (kind: string, id: string | number): string =>
  `${kind}${SEPARATOR}${id}`;

const toLandingSearch = ({ search, mark }: WriteLanding): LandingSearch | undefined => {
  if (mark === undefined) {
    return search;
  }

  return { ...search, [CHANGED_PARAM]: toLandingKey(mark.kind, mark.id) };
};

export const toLandingNavigation = (landing: WriteLanding): LandingNavigation => ({
  to: landing.to,
  params: Object.fromEntries(
    Object.entries(landing.params ?? {}).map(([name, value]) => [name, String(value)]),
  ),
  search: toLandingSearch(landing),
});
