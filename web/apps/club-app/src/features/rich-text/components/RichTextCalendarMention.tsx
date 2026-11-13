import { KkInlineLink } from '@furria/ui/KkInlineLink';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLocalIsoDay } from '@/lib/calendar-days';
import { calendarMentionLineOf } from '../mention-lines';
import { MENTION_CARD_LABELS } from '../rich-text-copy';
import { RichTextItemMention } from './RichTextItemMention';

const CALENDAR_ROUTE = '/calendar';

interface RichTextCalendarMentionProps {
  label: string;
  calendarEntryId: number;
  title: string;
  startsAt: string;
  isCancelled: boolean;
}

export const RichTextCalendarMention: FC<RichTextCalendarMentionProps> = ({
  label,
  calendarEntryId,
  title,
  startsAt,
  isCancelled,
}) => {
  const line = calendarMentionLineOf(startsAt, isCancelled);
  const search = { day: toLocalIsoDay(startsAt), entry: calendarEntryId };
  const action = (
    <KkInlineLink component={Link} to={CALENDAR_ROUTE} search={search}>
      {MENTION_CARD_LABELS.entryCta}
    </KkInlineLink>
  );

  return <RichTextItemMention label={label} name={title} line={line} action={action} />;
};
