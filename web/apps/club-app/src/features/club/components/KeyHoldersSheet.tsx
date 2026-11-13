import { KkPanel } from '@furria/ui/KkPanel';
import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import { toKeyHolderEntries } from '@/lib/key-holders';
import { toPeekId } from '@/lib/peek';
import { usePeek } from '@/lib/use-peek';
import type { ClubVenue } from '../schemas';
import { KeyHolderRow } from './KeyHolderRow';

const SHEET_CLOSE_LABEL = 'Schlüsselliste schließen';

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

  return (
    <KkSheet
      id={toPeekId('venue', venue.venueId)}
      title={venue.name}
      closeLabel={SHEET_CLOSE_LABEL}
    >
      <KkSheet.Body>
        <KkPanel>
          {entries.map((entry) => (
            <KeyHolderRow key={entry.personId} entry={entry} />
          ))}
        </KkPanel>
      </KkSheet.Body>
    </KkSheet>
  );
};
