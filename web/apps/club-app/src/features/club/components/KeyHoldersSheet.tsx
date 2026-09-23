import { KkEmptyState, KkPanel, KkSheet } from '@furria/ui';
import type { FC } from 'react';
import { toKeyHolderEntries } from '@/lib/key-holders';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import type { ClubVenue } from '../schemas';
import { KeyHolderRow } from './KeyHolderRow';

const SHEET_CLOSE_LABEL = 'Schlüsselliste schließen';
const NO_HOLDERS_TITLE = 'Kein Schlüssel vergeben';
const NO_HOLDERS_DESCRIPTION = 'Für diesen Ort ist kein Schlüssel ausgegeben.';

const toVenueId = (venue: ClubVenue): number => venue.venueId;

interface KeyHoldersSheetProps {
  venues: readonly ClubVenue[];
}

export const KeyHoldersSheet: FC<KeyHoldersSheetProps> = ({ venues }) => {
  const venue = usePeek('venue', venues, toVenueId);

  if (venue === null) {
    return null;
  }

  const entries = toKeyHolderEntries(venue.holders);

  const body =
    entries.length === 0 ? (
      <KkEmptyState size="panel" title={NO_HOLDERS_TITLE} description={NO_HOLDERS_DESCRIPTION} />
    ) : (
      <KkPanel>
        {entries.map((entry) => (
          <KeyHolderRow key={entry.personId} entry={entry} />
        ))}
      </KkPanel>
    );

  return (
    <KkSheet
      id={toPeekId('venue', venue.venueId)}
      title={venue.name}
      closeLabel={SHEET_CLOSE_LABEL}
    >
      <KkSheet.Body>{body}</KkSheet.Body>
    </KkSheet>
  );
};
