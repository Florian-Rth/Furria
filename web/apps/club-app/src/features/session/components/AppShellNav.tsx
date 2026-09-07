import { KkAppShell } from '@furria/ui';
import { Link, useMatchRoute } from '@tanstack/react-router';
import type { FC } from 'react';

export const AppShellNav: FC = () => {
  const matchRoute = useMatchRoute();
  const isOverviewActive = matchRoute({ to: '/' }) !== false;

  return (
    <KkAppShell.Nav>
      <KkAppShell.NavItem
        label="Übersicht"
        icon="home"
        component={Link}
        to="/"
        active={isOverviewActive}
      />
    </KkAppShell.Nav>
  );
};
