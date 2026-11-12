import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import type { FC } from 'react';
import type { AddOnAnswering } from '@/features/calendar/add-on-host';
import {
  CALENDAR_ADD_ON_ICONS,
  CALENDAR_ADD_ON_LABELS,
} from '@/features/calendar/calendar-add-ons';
import { CalendarDetailPoll } from '@/features/calendar/components/CalendarDetailPoll';
import { CalendarDetailSignUpList } from '@/features/calendar/components/CalendarDetailSignUpList';
import type { Announcement, AnnouncementAddOn } from '../schemas';
import { AnnouncementDetailAttendance } from './AnnouncementDetailAttendance';

interface AnnouncementDetailAddOnProps {
  addOn: AnnouncementAddOn;
  announcement: Announcement;
  answering: AddOnAnswering;
  closesAt: string | null;
}

export const AnnouncementDetailAddOn: FC<AnnouncementDetailAddOnProps> = ({
  addOn,
  announcement,
  answering,
  closesAt,
}) => {
  const mayModerate = announcement.viewerMayEdit;
  const content =
    addOn.kind === 'attendance' ? (
      <AnnouncementDetailAttendance announcement={announcement} attendance={addOn.attendance} />
    ) : addOn.kind === 'poll' ? (
      <CalendarDetailPoll
        poll={addOn.poll}
        answering={answering}
        mayClose={mayModerate}
        reopensUntil={closesAt}
      />
    ) : (
      <CalendarDetailSignUpList
        list={addOn.signUpList}
        answering={answering}
        mayModerate={mayModerate}
      />
    );

  return (
    <KkCalendarDetail.Section
      icon={CALENDAR_ADD_ON_ICONS[addOn.kind]}
      title={CALENDAR_ADD_ON_LABELS[addOn.kind]}
    >
      {content}
    </KkCalendarDetail.Section>
  );
};
