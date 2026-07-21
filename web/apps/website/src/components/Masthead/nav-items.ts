import type { LinkProps } from '@tanstack/react-router';

export interface NavItem {
  to: LinkProps['to'];
  label: string;
}

export const navItems: NavItem[] = [
  { to: '/program', label: 'Programm' },
  { to: '/club', label: 'Verein' },
  { to: '/news', label: 'Aktuelles' },
  { to: '/gallery', label: 'Galerie' },
  { to: '/join', label: 'Mitglied werden' },
];
