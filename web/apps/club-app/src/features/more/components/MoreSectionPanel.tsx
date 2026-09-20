import { KkHubRow, KkPanel, KkPanelSection } from '@furria/ui';
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
    <KkPanelSection title={title}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
