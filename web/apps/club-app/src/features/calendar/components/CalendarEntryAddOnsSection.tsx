import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { toHeldAnswerCount } from '../calendar-add-ons';
import type { CalendarParticipantPool } from '../calendar-authoring';
import { useCalendarAddOns } from '../hooks/use-calendar-add-ons';
import type { CalendarEntryEditorControl } from '../hooks/use-calendar-entry-editor';
import type { CalendarEntryReload } from '../hooks/use-calendar-entry-supplies';
import type { CalendarEntry, ParticipatingGroup } from '../schemas';
import { CalendarAddOnCard } from './CalendarAddOnCard';
import { CalendarAddOnRemovalDialog } from './CalendarAddOnRemovalDialog';
import { CalendarAddOnSheet } from './CalendarAddOnSheet';

const SECTION_TITLE = 'Bausteine';
const ADD_LABEL = 'Baustein hinzufügen';
const NO_GROUPS: readonly ParticipatingGroup[] = [];

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
  const addOns = useCalendarAddOns(control, entry);
  const answerCount = toHeldAnswerCount(entry);
  const heldGroups = entry?.participatingGroups ?? NO_GROUPS;

  const cards = addOns.attached.map((addOn) => (
    <CalendarAddOnCard
      key={addOn}
      addOn={addOn}
      addOns={addOns}
      control={control}
      answerCount={answerCount}
      heldGroups={heldGroups}
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
      <CalendarAddOnSheet addOns={addOns} />
      <CalendarAddOnRemovalDialog addOns={addOns} />
    </KkPanelSection>
  );
};
