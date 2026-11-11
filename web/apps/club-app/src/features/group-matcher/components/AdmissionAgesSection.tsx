import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkToggleChips } from '@furria/ui/KkToggleChips';
import type { FC } from 'react';
import { useAdmissionAges } from '../hooks/use-admission-ages';
import type { AdmissionAgeBand } from '../schemas';

const SECTION_TITLE = 'Aufnahmealter';

interface AdmissionAgesSectionProps {
  groupId: number;
  admissionAges: readonly AdmissionAgeBand[];
}

export const AdmissionAgesSection: FC<AdmissionAgesSectionProps> = ({ groupId, admissionAges }) => {
  const ages = useAdmissionAges(groupId, admissionAges);

  return (
    <KkPanelSection title={SECTION_TITLE}>
      <KkPanel variant="block">
        <KkToggleChips
          label={SECTION_TITLE}
          chips={ages.chips}
          selected={ages.selected}
          onToggle={ages.onToggle}
        />
      </KkPanel>
    </KkPanelSection>
  );
};
