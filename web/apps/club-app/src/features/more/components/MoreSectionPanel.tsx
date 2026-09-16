import { KkHubRow, KkPanel, KkPanelHeader } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { AppSection } from '@/features/session';

interface MoreSectionPanelProps {
  title: string;
  sections: readonly AppSection[];
}

export const MoreSectionPanel: FC<MoreSectionPanelProps> = ({ title, sections }) => {
  if (sections.length === 0) {
    return null;
  }

  const rows = sections.map((section) => (
    <KkHubRow
      key={section.id}
      label={section.label}
      icon={section.icon}
      meta={section.meta}
      hint={section.hint}
      component={Link}
      to={section.to}
    />
  ));

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkPanelHeader title={title} />
      <KkPanel>{rows}</KkPanel>
    </Stack>
  );
};
