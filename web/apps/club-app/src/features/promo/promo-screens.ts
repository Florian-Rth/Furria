const SCREEN_FILES = import.meta.glob<string>('./screens/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

export const PROMO_SCREENS = [
  'start',
  'calendar',
  'running-order',
  'table-plan',
  'act',
  'training',
  'news',
  'beer-list',
  'website',
  'website-events',
] as const;
export type PromoScreen = (typeof PROMO_SCREENS)[number];

const fileNameOf = (path: string): string =>
  path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));

export const screenOf = (screen: PromoScreen): string | null =>
  Object.entries(SCREEN_FILES).find(([path]) => fileNameOf(path) === screen)?.[1] ?? null;
