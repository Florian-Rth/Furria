import type { KkRichTextMentionProps } from '@furria/ui/rich-text-mention-view';
import type { FC } from 'react';
import { mentionCardOf } from '@/features/news/news-mentions';
import { useNewsMentionCards } from '../logic/news-mention-context';
import { NewsGroupMention } from './NewsGroupMention';
import { NewsPersonMention } from './NewsPersonMention';

export const NewsMention: FC<KkRichTextMentionProps> = ({ mention }) => {
  const cards = useNewsMentionCards();
  const card = mentionCardOf(mention, cards);

  if (card === null) {
    return mention.label;
  }

  if (card.kind === 'group') {
    return <NewsGroupMention label={mention.label} group={card.group} />;
  }

  return <NewsPersonMention label={mention.label} person={card.person} />;
};
