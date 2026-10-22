import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { CLUB_SECTIONS } from '@/features/session/app-sections';

export const ClubLinks: FC = () => {
  const rows = CLUB_SECTIONS.map((section) => (
    <KkHubRow
      key={section.id}
      label={section.label}
      icon={section.icon}
      meta={section.meta}
      component={Link}
      to={section.to}
    />
  ));

  return <KkPanel>{rows}</KkPanel>;
};
