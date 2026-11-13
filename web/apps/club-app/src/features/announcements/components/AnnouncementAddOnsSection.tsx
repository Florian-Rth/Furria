import { KkButton } from '@furria/ui/KkButton';
import { KkFormSection } from '@furria/ui/KkFormSection';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkSelectRow } from '@furria/ui/KkSelectRow';
import type { FC } from 'react';
import { CalendarAddOnRemovalDialog } from '@/features/calendar/components/CalendarAddOnRemovalDialog';
import { CalendarAddOnSheet } from '@/features/calendar/components/CalendarAddOnSheet';
import { toHeldCalendarAddOns } from '../announcement-add-ons';
import {
  ADD_ADD_ON_LABEL,
  ADD_ONS_SECTION_TITLE,
  BORROW_ADD_ONS_LABEL,
} from '../announcements-labels';
import { useAnnouncementAddOns } from '../hooks/use-announcement-add-ons';
import type { AnnouncementAddOnsEditor } from '../hooks/use-announcement-add-ons-editor';
import { useAnnouncementBorrowing } from '../hooks/use-announcement-borrowing';
import type { Announcement, AnnouncementAddOnCardForm } from '../schemas';
import { AnnouncementAddOnCard } from './AnnouncementAddOnCard';
import { AnnouncementBorrowSheet } from './AnnouncementBorrowSheet';

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
  const borrowing = useAnnouncementBorrowing(editor.borrowAddOns, cards);

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
  const isFull = addOns.offered.length === 0;
  const addButton = isFull ? null : (
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
      <AnnouncementBorrowSheet borrowing={borrowing} />
      <CalendarAddOnSheet
        sheetId={addOns.sheetId}
        offered={addOns.offered}
        onAttach={addOns.attach}
      >
        <KkSelectRow title={BORROW_ADD_ONS_LABEL} onClick={borrowing.openSheet} />
      </CalendarAddOnSheet>
      <CalendarAddOnRemovalDialog
        removal={addOns.removal}
        open={addOns.isRemovalOpen}
        onConfirm={addOns.confirmRemoval}
        onCancel={addOns.cancelRemoval}
      />
    </KkFormSection>
  );
};
