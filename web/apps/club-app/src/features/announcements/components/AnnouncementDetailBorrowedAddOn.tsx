import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { Link } from '@tanstack/react-router';
import type { FC, ReactNode } from 'react';
import {
  CALENDAR_ADD_ON_ICONS,
  CALENDAR_ADD_ON_LABELS,
} from '@/features/calendar/calendar-add-ons';
import { CalendarDetailAttendance } from '@/features/calendar/components/CalendarDetailAttendance';
import { CalendarDetailPoll } from '@/features/calendar/components/CalendarDetailPoll';
import { CalendarDetailSignUpList } from '@/features/calendar/components/CalendarDetailSignUpList';
import { CALENDAR_PATH } from '@/features/session/app-sections';
import { useBorrowedAddOn } from '../hooks/use-borrowed-add-on';
import type { AnnouncementAddOnKind, BorrowedAnnouncementAddOn } from '../schemas';

interface AnnouncementDetailBorrowedAddOnProps {
  addOn: BorrowedAnnouncementAddOn;
}

export const AnnouncementDetailBorrowedAddOn: FC<AnnouncementDetailBorrowedAddOnProps> = ({
  addOn,
}) => {
  const { lent, answering, mayModerate, source, search } = useBorrowedAddOn(addOn);
  const contents: Record<AnnouncementAddOnKind, ReactNode> = {
    attendance:
      lent?.kind === 'attendance' ? <CalendarDetailAttendance entry={addOn.entry} /> : null,
    poll:
      lent?.kind === 'poll' ? (
        <CalendarDetailPoll
          poll={lent.poll}
          answering={answering}
          mayClose={mayModerate}
          reopensUntil={addOn.entry.startsAt}
        />
      ) : null,
    signUpList:
      lent?.kind === 'signUpList' ? (
        <CalendarDetailSignUpList
          list={lent.signUpList}
          answering={answering}
          mayModerate={mayModerate}
        />
      ) : null,
  };

  return (
    <KkCalendarDetail.Section
      icon={CALENDAR_ADD_ON_ICONS[addOn.lentKind]}
      title={CALENDAR_ADD_ON_LABELS[addOn.lentKind]}
    >
      <KkInlineLink component={Link} to={CALENDAR_PATH} search={search}>
        {source}
      </KkInlineLink>
      {contents[addOn.lentKind]}
    </KkCalendarDetail.Section>
  );
};
