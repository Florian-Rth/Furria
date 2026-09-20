import { KkButton, KkEmptyState, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  partitionKeyHoldings,
  toArchivedVenueNote,
  toHandOutLabel,
  toVenueEmptyCopy,
  toVenueHolderMeta,
} from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';
import { KeyHistoryPanel } from './KeyHistoryPanel';
import { KeyHolderRow } from './KeyHolderRow';

const HAND_OUT_TEXT = 'Ausgeben';
const PANEL_GAP = 2;

interface KeyVenuePanelProps {
  venue: KeyVenue;
  onHandOut: (venueId: number) => void;
  onTakeBack: (keyHoldingId: number) => void;
}

export const KeyVenuePanel: FC<KeyVenuePanelProps> = ({ venue, onHandOut, onTakeBack }) => {
  const { running, ended } = partitionKeyHoldings(venue.holdings);
  const isArchived = venue.archivedOn !== null;
  const emptyCopy = toVenueEmptyCopy(venue.holdings);

  const handOut = (): void => {
    onHandOut(venue.venueId);
  };

  const action = isArchived ? null : (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      ariaLabel={toHandOutLabel(venue.name)}
      onClick={handOut}
    >
      {HAND_OUT_TEXT}
    </KkButton>
  );

  const description = venue.archivedOn === null ? undefined : toArchivedVenueNote(venue.archivedOn);

  const runningRows = running.map((holding) => (
    <KeyHolderRow key={holding.keyHoldingId} holding={holding} onTakeBack={onTakeBack} />
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
    <KkPanelSection
      title={venue.name}
      meta={toVenueHolderMeta(venue.holdings)}
      description={description}
      action={action}
    >
      <Stack sx={{ gap: PANEL_GAP, minWidth: 0 }}>
        {runningPanel}
        <KeyHistoryPanel holdings={ended} />
      </Stack>
    </KkPanelSection>
  );
};
