import type { FC } from 'react';
import { useLabDrafts } from '../hooks/use-lab-drafts';
import { LabDraftSection } from './LabDraftSection';

export const LabDraftSections: FC = () => {
  const sections = useLabDrafts().map((draft) => (
    <LabDraftSection key={draft.slug} draft={draft} />
  ));

  return <>{sections}</>;
};
