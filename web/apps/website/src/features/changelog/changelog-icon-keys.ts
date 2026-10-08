export const CHANGELOG_ICON_KEYS = [
  'palette',
  'campaign',
  'smartphone',
  'home',
  'groups',
  'newspaper',
  'photos',
  'membership',
  'tickets',
  'exchange',
] as const;

export type ChangelogIconKey = (typeof CHANGELOG_ICON_KEYS)[number];
