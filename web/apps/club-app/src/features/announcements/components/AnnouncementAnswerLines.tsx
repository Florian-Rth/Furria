import { KkBulletin } from '@furria/ui/KkBulletin';
import type { FC } from 'react';
import { CALENDAR_ADD_ON_ICONS } from '@/features/calendar/calendar-add-ons';
import type { AnnouncementAddOnMark } from '../announcement-add-ons';
import { ADD_ON_BADGE_STATES } from '../announcement-bulletin';
import {
  ANNOUNCEMENT_ANSWERS_LABEL,
  toAddOnFactLabel,
  toAddOnNameLabel,
} from '../announcements-labels';

interface AnnouncementAnswerLinesProps {
  marks: readonly AnnouncementAddOnMark[];
  onSelect?: (key: string) => void;
}

export const AnnouncementAnswerLines: FC<AnnouncementAnswerLinesProps> = ({ marks, onSelect }) => {
  if (marks.length === 0) {
    return null;
  }

  const lines = marks.map((mark) => {
    const select = onSelect === undefined ? undefined : () => onSelect(mark.key);

    return (
      <KkBulletin.Line
        key={mark.key}
        icon={CALENDAR_ADD_ON_ICONS[mark.kind]}
        state={ADD_ON_BADGE_STATES[mark.state]}
        name={toAddOnNameLabel(mark)}
        fact={toAddOnFactLabel(mark)}
        onSelect={select}
      />
    );
  });

  return <KkBulletin.Lines label={ANNOUNCEMENT_ANSWERS_LABEL}>{lines}</KkBulletin.Lines>;
};
