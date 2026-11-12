import { KkAddOnCard } from '@furria/ui/KkAddOnCard';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkFormPair } from '@furria/ui/KkFormPair';
import { KkTimeField } from '@furria/ui/KkTimeField';
import type { FC } from 'react';
import {
  CALENDAR_ADD_ON_ICONS,
  CALENDAR_ADD_ON_LABELS,
} from '@/features/calendar/calendar-add-ons';
import {
  ANNOUNCEMENT_DEADLINE_EMPTY_LABEL,
  ANSWERS_UNTIL_DAY_LABEL,
  DEADLINE_TIME_LABEL,
  REMOVE_ATTENDANCE_LABEL,
} from '../announcements-labels';
import type { AnnouncementAddOnsEditor } from '../hooks/use-announcement-add-ons-editor';
import { useAnnouncementAttendanceCard } from '../hooks/use-announcement-attendance-card';
import type { Announcement, AnnouncementAttendanceForm } from '../schemas';

interface AnnouncementAttendanceCardProps {
  index: number;
  attendance: AnnouncementAttendanceForm;
  editor: AnnouncementAddOnsEditor;
  announcement: Announcement | null;
  onRemove: () => void;
}

export const AnnouncementAttendanceCard: FC<AnnouncementAttendanceCardProps> = ({
  index,
  attendance,
  editor,
  announcement,
  onRemove,
}) => {
  const card = useAnnouncementAttendanceCard({ editor, index, attendance, announcement });

  return (
    <KkAddOnCard
      icon={CALENDAR_ADD_ON_ICONS.attendance}
      title={CALENDAR_ADD_ON_LABELS.attendance}
      meta={card.metaLabel}
      removeLabel={REMOVE_ATTENDANCE_LABEL}
      onRemove={onRemove}
    >
      <KkFormPair
        balance="leading"
        start={
          <KkDateField
            name={card.fieldNames.answersUntilDay}
            label={ANSWERS_UNTIL_DAY_LABEL}
            value={attendance.answersUntilDay}
            onChange={card.setAnswersUntilDay}
            allowEmpty
            emptyLabel={ANNOUNCEMENT_DEADLINE_EMPTY_LABEL}
            disabled={card.isFrozen}
          />
        }
        end={
          <KkTimeField
            name={card.fieldNames.answersUntilTime}
            label={DEADLINE_TIME_LABEL}
            value={attendance.answersUntilTime}
            onChange={card.setAnswersUntilTime}
            disabled={card.isTimeLocked}
            error={card.deadlineError.hasError}
            helperText={card.deadlineError.text}
          />
        }
      />
    </KkAddOnCard>
  );
};
