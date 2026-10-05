import { KkChip, KkMeta, KkPanelSection, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { EntryVenueView } from '../entry-sheet';

const SECTION_TITLE = 'Ort';
const KEY_LABEL = 'Dein Schlüssel';

interface EntryVenueSectionProps {
  venue: EntryVenueView;
}

export const EntryVenueSection: FC<EntryVenueSectionProps> = ({ venue }) => {
  const lines = venue.lines.map((line) => <KkMeta key={line}>{line}</KkMeta>);
  const key = venue.holdsKey ? <KkChip size="small">{KEY_LABEL}</KkChip> : null;

  return (
    <KkPanelSection title={SECTION_TITLE}>
      <Stack sx={{ gap: 0.25, minWidth: 0 }}>
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', minWidth: 0 }}>
          <KkText variant="subtitle2">{venue.name}</KkText>
          {key}
        </Stack>
        {lines}
      </Stack>
    </KkPanelSection>
  );
};
