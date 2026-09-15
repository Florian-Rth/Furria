import { KkHubRow, KkPanel } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { CLUB_SECTIONS } from '@/features/session';

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
