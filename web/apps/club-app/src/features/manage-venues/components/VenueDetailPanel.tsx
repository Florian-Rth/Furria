import { formatOpeningHours } from '@furria/api-client/opening-hours';
import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useLanding } from '@/features/write/hooks/use-landing';
import { toLandingKey } from '@/features/write/landing-target';
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
const OPENING_HOURS_LABEL = 'Öffnungszeiten';
const NO_OPENING_HOURS_NOTE = 'Keine Öffnungszeiten eingetragen.';
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

  const openingLines = formatOpeningHours(venue.openingHours);
  const openingHours =
    openingLines.length === 0 ? (
      <KkNote>{NO_OPENING_HOURS_NOTE}</KkNote>
    ) : (
      openingLines.map((line) => (
        <KkFieldRow key={line.days} label={line.days} value={line.times} />
      ))
    );

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
      <KkPanelSection title={OPENING_HOURS_LABEL}>
        <KkPanel>{openingHours}</KkPanel>
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
