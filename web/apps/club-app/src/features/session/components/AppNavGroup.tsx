import { KkAppShell, KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link, useMatchRoute } from '@tanstack/react-router';
import type { FC } from 'react';
import type { AppSectionGroup } from '../app-sections';
import { toNavMatch } from '../app-sections';

interface AppNavGroupProps {
  group: AppSectionGroup;
}

export const AppNavGroup: FC<AppNavGroupProps> = ({ group }) => {
  const matchRoute = useMatchRoute();

  const items = group.sections.map((section) => {
    const navMatch = toNavMatch(section);

    if (navMatch === null) {
      return (
        <KkAppShell.NavItem
          key={section.id}
          label={section.label}
          icon={section.icon}
          hint={section.hint}
          disabled
        />
      );
    }

    return (
      <KkAppShell.NavItem
        key={section.id}
        label={section.label}
        icon={section.icon}
        component={Link}
        to={navMatch.to}
        params={navMatch.params}
        active={matchRoute(navMatch) !== false}
      />
    );
  });

  const heading = group.label === null ? null : <KkEyebrow tone="muted">{group.label}</KkEyebrow>;

  return (
    <Stack sx={{ minWidth: 0, gap: 0.75 }}>
      {heading}
      <KkAppShell.Nav sx={{ flex: 'none' }}>{items}</KkAppShell.Nav>
    </Stack>
  );
};
