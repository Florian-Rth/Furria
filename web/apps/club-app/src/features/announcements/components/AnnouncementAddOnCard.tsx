import type { FC } from 'react';
import { CalendarPollCard } from '@/features/calendar/components/CalendarPollCard';
import { CalendarSignUpListCard } from '@/features/calendar/components/CalendarSignUpListCard';
import type { CalendarAddOnsControl } from '@/features/calendar/hooks/use-calendar-add-ons';
import type { CalendarEntryAddOn } from '@/features/calendar/schemas';
import { ANNOUNCEMENT_DEADLINE_EMPTY_LABEL } from '../announcements-labels';
import type { AnnouncementAddOnsEditor } from '../hooks/use-announcement-add-ons-editor';
import type { Announcement, AnnouncementAddOnCardForm } from '../schemas';
import { AnnouncementAttendanceCard } from './AnnouncementAttendanceCard';
import { AnnouncementBorrowedAddOnCard } from './AnnouncementBorrowedAddOnCard';

interface AnnouncementAddOnCardProps {
  card: AnnouncementAddOnCardForm;
  index: number;
  addOns: CalendarAddOnsControl<AnnouncementAddOnCardForm>;
  editor: AnnouncementAddOnsEditor;
  announcement: Announcement | null;
  held: readonly CalendarEntryAddOn[] | null;
}

export const AnnouncementAddOnCard: FC<AnnouncementAddOnCardProps> = ({
  card,
  index,
  addOns,
  editor,
  announcement,
  held,
}) => {
  const remove = (): void => {
    addOns.askRemoval(card);
  };

  switch (card.kind) {
    case 'borrowed':
      return <AnnouncementBorrowedAddOnCard borrowed={card.borrowed} onRemove={remove} />;
    case 'attendance':
      return (
        <AnnouncementAttendanceCard
          index={index}
          attendance={card.attendance}
          editor={editor}
          announcement={announcement}
          onRemove={remove}
        />
      );
    case 'poll':
      return (
        <CalendarPollCard
          cardKey={card.key}
          index={index}
          poll={card.poll}
          editor={editor}
          held={held}
          deadlineEmptyLabel={ANNOUNCEMENT_DEADLINE_EMPTY_LABEL}
          onRemove={remove}
        />
      );
    case 'signUpList':
      return (
        <CalendarSignUpListCard
          cardKey={card.key}
          index={index}
          list={card.signUpList}
          editor={editor}
          held={held}
          deadlineEmptyLabel={ANNOUNCEMENT_DEADLINE_EMPTY_LABEL}
          onRemove={remove}
        />
      );
  }
};
