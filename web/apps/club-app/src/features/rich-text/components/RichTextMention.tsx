import type { KkRichTextMentionProps } from '@furria/ui/rich-text-mention-view';
import type { FC } from 'react';
import { mentionCardOf } from '../mention-cards';
import { useMentionCards } from '../rich-text-mention-context';
import { RichTextAlbumMention } from './RichTextAlbumMention';
import { RichTextCalendarMention } from './RichTextCalendarMention';
import { RichTextGroupMention } from './RichTextGroupMention';
import { RichTextNewsPostMention } from './RichTextNewsPostMention';
import { RichTextPersonMention } from './RichTextPersonMention';

export const RichTextMention: FC<KkRichTextMentionProps> = ({ mention }) => {
  const cards = useMentionCards();
  const card = mentionCardOf(mention, cards);

  if (card === null) {
    return mention.label;
  }
  switch (card.kind) {
    case 'group':
      return <RichTextGroupMention label={mention.label} group={card.group} />;
    case 'person':
      return <RichTextPersonMention label={mention.label} person={card.person} />;
    case 'calendar-entry':
      return (
        <RichTextCalendarMention
          label={mention.label}
          calendarEntryId={card.entry.calendarEntryId}
          title={card.entry.title}
          startsAt={card.entry.startsAt}
          isCancelled={false}
        />
      );
    case 'event':
      return (
        <RichTextCalendarMention
          label={mention.label}
          calendarEntryId={card.event.eventId}
          title={card.event.title}
          startsAt={card.event.startsAt}
          isCancelled={card.event.isCancelled}
        />
      );
    case 'news-post':
      return <RichTextNewsPostMention label={mention.label} post={card.post} />;
    case 'album':
      return <RichTextAlbumMention label={mention.label} album={card.album} />;
  }
};
