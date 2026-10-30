import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import type { LabDraft } from '../lab-drafts';
import { LabDraftRow } from './LabDraftRow';

interface LabDraftSectionProps {
  draft: LabDraft;
}

export const LabDraftSection: FC<LabDraftSectionProps> = ({ draft }) => {
  const rows = draft.links.map((link) => <LabDraftRow key={link.key} link={link} />);

  return (
    <KkPanelSection title={draft.title} description={draft.lead}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
