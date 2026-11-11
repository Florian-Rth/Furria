import type { KkToggleChip } from '@furria/ui/KkToggleChips';
import { useSetAdmissionAgesMutation } from '../api';
import { ADMISSION_AGE_LABELS } from '../group-matcher-labels';
import { toggleAdmissionAge } from '../group-matcher-page';
import type { AdmissionAgeBand } from '../schemas';
import { ADMISSION_AGE_BANDS } from '../schemas';

const ADMISSION_AGE_CHIPS: readonly KkToggleChip[] = ADMISSION_AGE_BANDS.map((band) => ({
  id: band,
  label: ADMISSION_AGE_LABELS[band],
}));

const toBand = (id: string): AdmissionAgeBand | null =>
  ADMISSION_AGE_BANDS.find((band) => band === id) ?? null;

export interface AdmissionAgesControl {
  chips: readonly KkToggleChip[];
  selected: readonly string[];
  onToggle: (id: string) => void;
}

export const useAdmissionAges = (
  groupId: number,
  admissionAges: readonly AdmissionAgeBand[],
): AdmissionAgesControl => {
  const setAdmissionAges = useSetAdmissionAgesMutation(groupId);

  const onToggle = (id: string): void => {
    const band = toBand(id);

    if (band !== null) {
      setAdmissionAges.mutate(toggleAdmissionAge(admissionAges, band));
    }
  };

  return { chips: ADMISSION_AGE_CHIPS, selected: admissionAges, onToggle };
};
