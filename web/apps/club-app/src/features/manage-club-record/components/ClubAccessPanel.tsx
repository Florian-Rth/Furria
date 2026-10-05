import { KkFieldRow } from '@furria/ui';
import type { FC } from 'react';
import { toAgeOfConsentLabel } from '../club-record-labels';
import type { ClubRecord } from '../schemas';
import { ClubRecordSection } from './ClubRecordSection';

const AGE_LABEL = 'Mindestalter für App und Online-Antrag';
const AGE_HINT = 'Jüngere werden nicht eingeladen und können sich nicht online bewerben.';

interface ClubAccessPanelProps {
  record: ClubRecord;
  highlightedKey: string | null;
}

export const ClubAccessPanel: FC<ClubAccessPanelProps> = ({ record, highlightedKey }) => {
  const age = toAgeOfConsentLabel(record.ageOfConsent);

  return (
    <ClubRecordSection section="access" highlightedKey={highlightedKey}>
      <KkFieldRow label={AGE_LABEL} value={age} hint={AGE_HINT} />
    </ClubRecordSection>
  );
};
