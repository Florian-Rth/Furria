import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { CalendarAttendanceAnswer } from '@/features/calendar/components/CalendarAttendanceAnswer';
import { CalendarAttendanceRoll } from '@/features/calendar/components/CalendarAttendanceRoll';
import { CalendarCloseAction } from '@/features/calendar/components/CalendarCloseAction';
import { CalendarNamesSheet } from '@/features/calendar/components/CalendarNamesSheet';
import { CalendarReminderAction } from '@/features/calendar/components/CalendarReminderAction';
import { CLOSE_ATTENDANCE_LABEL } from '../announcements-labels';
import { useAnnouncementAttendance } from '../hooks/use-announcement-attendance';
import type { Announcement, AnnouncementAttendance } from '../schemas';

const NO_TABS = [] as const;

interface AnnouncementDetailAttendanceProps {
  announcement: Announcement;
  attendance: AnnouncementAttendance;
}

export const AnnouncementDetailAttendance: FC<AnnouncementDetailAttendanceProps> = ({
  announcement,
  attendance,
}) => {
  const control = useAnnouncementAttendance(announcement, attendance);
  const tabs = control.roll?.tabs ?? NO_TABS;
  const closeAction = control.canClose ? (
    <CalendarCloseAction
      label={CLOSE_ATTENDANCE_LABEL}
      copy={control.closeCopy}
      isClosing={control.isClosing}
      onClose={control.close}
    />
  ) : null;

  return (
    <Stack sx={{ gap: 1.5, minWidth: 0 }}>
      <KkMeta tone="faint">{control.meta}</KkMeta>
      <CalendarAttendanceAnswer answer={control.answer} />
      <CalendarAttendanceRoll roll={control.roll} onOpen={control.sheet.open} />
      <CalendarNamesSheet
        title={announcement.title}
        tabs={tabs}
        sheet={control.sheet}
        openAction={<CalendarReminderAction source={control.reminder} />}
      />
      {closeAction}
    </Stack>
  );
};
