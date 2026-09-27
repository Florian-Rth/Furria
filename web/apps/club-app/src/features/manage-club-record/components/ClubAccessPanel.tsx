import { KkFieldRow } from '@furria/ui';
import type { FC } from 'react';
import { toAgeOfConsentLabel } from '../club-record-labels';
import type { ClubRecord } from '../schemas';
import { ClubRecordSection } from './ClubRecordSection';

const AGE_LABEL = 'Mindestalter für einen Zugang';
const AGE_HINT = 'Jüngere Personen können nicht eingeladen werden.';

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
