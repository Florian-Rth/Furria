import { KkAppShell } from '@furria/ui';
import { Link, useMatchRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import { APP_SECTIONS } from '../app-sections';

export const AppNav: FC = () => {
  const matchRoute = useMatchRoute();

  const items = APP_SECTIONS.map((section) => {
    if (section.to === null) {
      return (
        <KkAppShell.NavItem key={section.id} label={section.label} icon={section.icon} disabled />
      );
    }

    return (
      <KkAppShell.NavItem
        key={section.id}
        label={section.label}
        icon={section.icon}
        component={Link}
        to={section.to}
        active={matchRoute({ to: section.to }) !== false}
      />
    );
  });

  return <KkAppShell.Nav>{items}</KkAppShell.Nav>;
};
