import type { KkPanelAction } from '@furria/ui';
import { KkConfirmDialog, KkFieldRow, KkPanel, KkPanelSection, KkWriteScreen } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey, useLanding } from '@/features/write';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useVenueArchive } from '../hooks/use-venue-archive';
import {
  ARCHIVE_EXPLANATION,
  ARCHIVE_EYEBROW,
  ARCHIVE_VENUE_LABEL,
  toArchiveConsequence,
  toArchiveQuestion,
  toVenueAddressLine,
  toVenueFacts,
  VENUE_EDIT_LABEL,
  VENUE_WITHOUT_ADDRESS,
} from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const ADDRESS_LABEL = 'Anschrift';
const EDIT_ACTION_LABEL = 'Ort bearbeiten';
const EDIT_ROUTE = '/manage/venues/$venueId/edit';

interface VenueDetailPanelProps {
  venue: ManagedVenue;
}

export const VenueDetailPanel: FC<VenueDetailPanelProps> = ({ venue }) => {
  const archive = useVenueArchive(venue);
  const { highlightedKey } = useLanding();
  const today = formatIsoDay(toIsoDay(new Date()));
  const landingKey = toLandingKey('venue', venue.venueId);
  const addressLine = toVenueAddressLine(venue) ?? VENUE_WITHOUT_ADDRESS;

  const action: KkPanelAction = {
    label: VENUE_EDIT_LABEL,
    icon: 'edit',
    ariaLabel: EDIT_ACTION_LABEL,
    component: Link,
    to: EDIT_ROUTE,
    params: { venueId: String(venue.venueId) },
  };

  return (
    <>
      <KkPanelSection title={ADDRESS_LABEL} action={action}>
        <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
          <KkFieldRow label={ADDRESS_LABEL} value={addressLine} hint={venue.hint ?? undefined} />
        </KkPanel>
      </KkPanelSection>
      <KkWriteScreen.Danger label={ARCHIVE_VENUE_LABEL} onSelect={archive.open} />
      <KkConfirmDialog
        open={archive.isOpen}
        onClose={archive.close}
        onConfirm={archive.submit}
        tone="danger"
        eyebrow={ARCHIVE_EYEBROW}
        question={toArchiveQuestion(venue.name)}
        explanation={ARCHIVE_EXPLANATION}
        facts={toVenueFacts(venue, today)}
        consequence={toArchiveConsequence(venue.name, today)}
        error={archive.rejection ?? undefined}
        confirmLabel={ARCHIVE_VENUE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={archive.isSaving}
      />
    </>
  );
};
