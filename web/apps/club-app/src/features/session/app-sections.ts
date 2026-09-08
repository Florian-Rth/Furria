import type { KkIconName } from '@furria/ui';

export interface AppSection {
  id: string;
  label: string;
  icon: KkIconName;
  to: string | null;
}

export const OVERVIEW_PATH = '/';
export const PROFILE_PATH = '/profile';

export const APP_SECTIONS: AppSection[] = [
  { id: 'overview', label: 'Übersicht', icon: 'overview', to: OVERVIEW_PATH },
  { id: 'events', label: 'Veranstaltungen', icon: 'events', to: null },
  { id: 'live', label: 'Live-Regie', icon: 'live', to: null },
  { id: 'members', label: 'Mitglieder', icon: 'members', to: null },
  { id: 'fees', label: 'Beitrag', icon: 'fees', to: null },
  { id: 'gallery', label: 'Galerie', icon: 'gallery', to: null },
  { id: 'wardrobe', label: 'Klamotten', icon: 'wardrobe', to: null },
];

const OVERVIEW_TITLE = 'Übersicht';

const ROUTE_TITLES: Record<string, string> = {
  [OVERVIEW_PATH]: OVERVIEW_TITLE,
  [PROFILE_PATH]: 'Profil',
};

export const resolveSectionTitle = (pathname: string): string =>
  ROUTE_TITLES[pathname] ?? OVERVIEW_TITLE;
