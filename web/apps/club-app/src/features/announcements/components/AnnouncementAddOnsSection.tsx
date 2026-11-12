import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkIcon } from '@furria/ui/KkIcon';
import type { FC } from 'react';
import { CalendarAddOnRemovalDialog } from '@/features/calendar/components/CalendarAddOnRemovalDialog';
import { CalendarAddOnSheet } from '@/features/calendar/components/CalendarAddOnSheet';
import { toHeldCalendarAddOns } from '../announcement-add-ons';
import { ADD_ADD_ON_LABEL, ADD_ONS_SECTION_TITLE } from '../announcements-labels';
import { useAnnouncementAddOns } from '../hooks/use-announcement-add-ons';
import type { AnnouncementAddOnsEditor } from '../hooks/use-announcement-add-ons-editor';
import type { Announcement, AnnouncementAddOnCardForm } from '../schemas';
import { AnnouncementAddOnCard } from './AnnouncementAddOnCard';

interface AnnouncementAddOnsSectionProps {
  cards: readonly AnnouncementAddOnCardForm[];
  editor: AnnouncementAddOnsEditor;
  announcement: Announcement | null;
}

export const AnnouncementAddOnsSection: FC<AnnouncementAddOnsSectionProps> = ({
  cards,
  editor,
  announcement,
}) => {
  const addOns = useAnnouncementAddOns(editor, cards, announcement);
  const held = toHeldCalendarAddOns(announcement);

  const attached = cards.map((card, index) => (
    <AnnouncementAddOnCard
      key={card.key}
      card={card}
      index={index}
      addOns={addOns}
      editor={editor}
      announcement={announcement}
      held={held}
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
        {ADD_ADD_ON_LABEL}
      </KkButton>
    );

  return (
    <KkFormSection title={ADD_ONS_SECTION_TITLE}>
      {attached}
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
    </KkFormSection>
  );
};
