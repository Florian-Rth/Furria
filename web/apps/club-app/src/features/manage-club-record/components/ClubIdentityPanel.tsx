import { KkFieldRow } from '@furria/ui';
import type { FC } from 'react';
import { MISSING_VALUE } from '../club-record-labels';
import type { ClubRecord } from '../schemas';
import { ClubRecordSection } from './ClubRecordSection';

const NAME_LABEL = 'Vereinsname';
const SHORT_NAME_LABEL = 'Kurzname';
const FOUNDED_LABEL = 'Gründungsjahr';

interface ClubIdentityPanelProps {
  record: ClubRecord;
  highlightedKey: string | null;
}

export const ClubIdentityPanel: FC<ClubIdentityPanelProps> = ({ record, highlightedKey }) => {
  const foundedYear = record.foundedYear === null ? MISSING_VALUE : String(record.foundedYear);

  return (
    <ClubRecordSection section="identity" highlightedKey={highlightedKey}>
      <KkFieldRow label={NAME_LABEL} value={record.name ?? MISSING_VALUE} />
      <KkFieldRow label={SHORT_NAME_LABEL} value={record.shortName ?? MISSING_VALUE} />
      <KkFieldRow label={FOUNDED_LABEL} value={foundedYear} />
    </ClubRecordSection>
  );
};
