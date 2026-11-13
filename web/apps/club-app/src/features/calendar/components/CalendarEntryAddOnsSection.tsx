import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { useCalendarEntryAddOns } from '../hooks/use-calendar-entry-add-ons';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import type { CalendarEntry } from '../schemas';
import { CalendarAddOnCard } from './CalendarAddOnCard';
import { CalendarAddOnRemovalDialog } from './CalendarAddOnRemovalDialog';
import { CalendarAddOnSheet } from './CalendarAddOnSheet';

const SECTION_TITLE = 'Funktionen';
const ADD_LABEL = 'Funktion hinzufügen';

interface CalendarEntryAddOnsSectionProps {
  control: CalendarEntryEditorControl;
  entry: CalendarEntry | null;
  clubGroups: CalendarParticipantPool;
  clubGroupsReload: CalendarEntryReload | null;
}

export const CalendarEntryAddOnsSection: FC<CalendarEntryAddOnsSectionProps> = ({
  control,
  entry,
  clubGroups,
  clubGroupsReload,
}) => {
  const addOns = useCalendarEntryAddOns(control, entry);

  const cards = control.values.addOns.map((card, index) => (
    <CalendarAddOnCard
      key={card.key}
      card={card}
      index={index}
      addOns={addOns}
      control={control}
      entry={entry}
      clubGroups={clubGroups}
      clubGroupsReload={clubGroupsReload}
    />
  ));

  const addButton =
    addOns.offered.length === 0 ? null : (
      <KkButton
        variant="outlined"
        size="small"
        startIcon={<KkIcon name="add" size="small" />}
        onClick={addOns.openSheet}
        sx={{ alignSelf: 'flex-start' }}
      >
        {ADD_LABEL}
      </KkButton>
    );

  return (
    <KkPanelSection title={SECTION_TITLE}>
      {cards}
      {addButton}
      <CalendarAddOnSheet
        sheetId={addOns.sheetId}
        offered={addOns.offered}
        onAttach={addOns.attach}
      />
      <CalendarAddOnRemovalDialog
        removal={addOns.removal}
        open={addOns.isRemovalOpen}
        onConfirm={addOns.confirmRemoval}
        onCancel={addOns.cancelRemoval}
      />
    </KkPanelSection>
  );
};
