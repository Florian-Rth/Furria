import type { LinkProps } from '@tanstack/react-router';

export interface NavItem {
  to: LinkProps['to'];
  label: string;
}

// The ONE nav source — rendered by the desktop bar and the mobile drawer alike.
// Full IA from day one so the masthead never visually churns (site-shell plan).
export const navItems: NavItem[] = [
  { to: '/program', label: 'Programm' },
  { to: '/club', label: 'Verein' },
  { to: '/news', label: 'Aktuelles' },
  { to: '/gallery', label: 'Galerie' },
  { to: '/join', label: 'Mitglied werden' },
];
