import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { VenueEditorControl } from '../hooks/use-venue-editor';
import { VenueOpeningSlotFields } from './VenueOpeningSlotFields';

const SECTION_TITLE = 'Öffnungszeiten';
const SECTION_DESCRIPTION =
  'Für Orte mit Kartenvorverkauf: Die Website zeigt die Zeiten bei jeder Veranstaltung, die hier Karten verkauft. Mehrere Zeiten an einem Tag sind möglich, etwa 9–12 und 14–18 Uhr.';
const ADD_LABEL = 'Zeit hinzufügen';
const ADD_ICON = <KkIcon name="add" size="small" />;

interface VenueOpeningHoursSectionProps {
  control: VenueEditorControl;
}

export const VenueOpeningHoursSection: FC<VenueOpeningHoursSectionProps> = ({ control }) => {
  const slots = control.openingSlots.map((slot, index) => (
    <VenueOpeningSlotFields key={slot.key} control={slot} index={index} />
  ));

  return (
    <KkFormSection title={SECTION_TITLE} description={SECTION_DESCRIPTION}>
      {slots}
      <Stack direction="row">
        <KkButton
          variant="outlined"
          size="small"
          startIcon={ADD_ICON}
          disabled={!control.canAddOpeningSlot}
          onClick={control.addOpeningSlot}
        >
          {ADD_LABEL}
        </KkButton>
      </Stack>
    </KkFormSection>
  );
};
