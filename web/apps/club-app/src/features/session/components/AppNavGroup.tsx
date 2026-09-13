import { KkAppShell, KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link, useRouterState } from '@tanstack/react-router';
import type { FC } from 'react';
import type { AppSectionGroup } from '../app-sections';
import { isNavMatchActive, toNavMatch } from '../app-sections';

interface AppNavGroupProps {
  group: AppSectionGroup;
}

export const AppNavGroup: FC<AppNavGroupProps> = ({ group }) => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const labelTransform = group.id === 'my-groups' ? 'none' : 'uppercase';

  const items = group.sections.map((section) => {
    const navMatch = toNavMatch(section);

    if (navMatch === null) {
      return (
        <KkAppShell.NavItem
          key={section.id}
          label={section.label}
          icon={section.icon}
          hint={section.hint}
          transform={labelTransform}
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
        transform={labelTransform}
        active={isNavMatchActive(navMatch, pathname)}
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
