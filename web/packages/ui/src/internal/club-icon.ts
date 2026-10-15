export const KK_CLUB_ICONS = [
  'crown',
  'euro',
  'bolt',
  'shield',
  'camera',
  'sparkle',
  'mic',
  'musicNote',
  'drum',
  'mask',
  'megaphone',
  'star',
  'trophy',
  'flag',
  'key',
  'shirt',
  'pen',
  'wrench',
  'palette',
  'heart',
  'mug',
  'calendar',
  'whistle',
  'broom',
] as const;

export type KkClubIcon = (typeof KK_CLUB_ICONS)[number];

export const isKkClubIcon = (value: string): value is KkClubIcon =>
  (KK_CLUB_ICONS as readonly string[]).includes(value);
