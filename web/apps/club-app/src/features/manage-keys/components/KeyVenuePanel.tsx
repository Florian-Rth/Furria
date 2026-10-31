import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  partitionKeyHoldings,
  toArchivedVenueNote,
  toHandOutLabel,
  toVenueEmptyCopy,
} from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';
import { KeyHistoryPanel } from './KeyHistoryPanel';
import { KeyHolderRow } from './KeyHolderRow';

const HAND_OUT_TEXT = 'Schlüssel';
const PANEL_GAP = 2;
const NEW_HOLDING_ROUTE = '/manage/keys/$venueId/holdings/new';

interface KeyVenuePanelProps {
  venue: KeyVenue;
  highlightedKey: string | null;
}

export const KeyVenuePanel: FC<KeyVenuePanelProps> = ({ venue, highlightedKey }) => {
  const { running, ended } = partitionKeyHoldings(venue.holdings);
  const isArchived = venue.archivedOn !== null;
  const emptyCopy = toVenueEmptyCopy(venue.holdings);

  const action: KkPanelAction | undefined = isArchived
    ? undefined
    : {
        label: HAND_OUT_TEXT,
        icon: 'add',
        ariaLabel: toHandOutLabel(venue.name),
        component: Link,
        to: NEW_HOLDING_ROUTE,
        params: { venueId: String(venue.venueId) },
      };

  const archivedNote =
    venue.archivedOn === null ? null : <KkNote>{toArchivedVenueNote(venue.archivedOn)}</KkNote>;

  const runningRows = running.map((holding) => (
    <KeyHolderRow key={holding.keyHoldingId} holding={holding} highlightedKey={highlightedKey} />
  ));

  const runningPanel =
    runningRows.length === 0 ? (
      <KkPanel variant="block" dimmed={isArchived}>
        <KkEmptyState size="panel" title={emptyCopy.title} description={emptyCopy.description} />
      </KkPanel>
    ) : (
      <KkPanel variant="list" dimmed={isArchived}>
        {runningRows}
      </KkPanel>
    );

  return (
    <KkPanelSection title={venue.name} action={action}>
      <Stack sx={{ gap: PANEL_GAP, minWidth: 0 }}>
        {archivedNote}
        {runningPanel}
        <KeyHistoryPanel holdings={ended} highlightedKey={highlightedKey} />
      </Stack>
    </KkPanelSection>
  );
};
