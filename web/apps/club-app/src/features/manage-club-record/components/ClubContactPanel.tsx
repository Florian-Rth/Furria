import { KkFieldRow } from '@furria/ui';
import type { FC } from 'react';
import { formatAddress } from '@/lib/membership-labels';
import { MISSING_VALUE } from '../club-record-labels';
import type { ClubRecord } from '../schemas';
import { ClubRecordSection } from './ClubRecordSection';

const ADDRESS_LABEL = 'Anschrift';
const EMAIL_LABEL = 'E-Mail';
const PHONE_LABEL = 'Telefon';
const WEBSITE_LABEL = 'Website';
const INSTAGRAM_LABEL = 'Instagram';
const FACEBOOK_LABEL = 'Facebook';
const DESCRIPTION = 'Steht im Impressum und überall, wo der Verein erreichbar sein muss.';

interface ClubContactPanelProps {
  record: ClubRecord;
  highlightedKey: string | null;
}

export const ClubContactPanel: FC<ClubContactPanelProps> = ({ record, highlightedKey }) => {
  const address = formatAddress(record.street, record.zip, record.city);

  return (
    <ClubRecordSection section="contact" highlightedKey={highlightedKey} description={DESCRIPTION}>
      <KkFieldRow label={ADDRESS_LABEL} value={address ?? MISSING_VALUE} />
      <KkFieldRow label={EMAIL_LABEL} value={record.email ?? MISSING_VALUE} />
      <KkFieldRow label={PHONE_LABEL} value={record.phone ?? MISSING_VALUE} />
      <KkFieldRow label={WEBSITE_LABEL} value={record.websiteUrl ?? MISSING_VALUE} />
      <KkFieldRow label={INSTAGRAM_LABEL} value={record.instagramUrl ?? MISSING_VALUE} />
      <KkFieldRow label={FACEBOOK_LABEL} value={record.facebookUrl ?? MISSING_VALUE} />
    </ClubRecordSection>
  );
};
