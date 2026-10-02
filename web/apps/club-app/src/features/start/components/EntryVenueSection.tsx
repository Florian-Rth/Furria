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
      <Stack direction="row" sx={{ gap: 1, alignItems: 'flex-start', minWidth: 0 }}>
        <Stack sx={{ gap: 0.25, flex: '1 1 auto', minWidth: 0 }}>
          <KkText variant="subtitle2">{venue.name}</KkText>
          {lines}
        </Stack>
        {key}
      </Stack>
    </KkPanelSection>
  );
};
