import type { KkNewsTextMentionProps } from '@furria/ui';
import type { FC } from 'react';
import { mentionCardOf } from '@/features/news/news-mentions';
import { useNewsMentionCards } from '../logic/news-mention-context';
import { NewsGroupMention } from './NewsGroupMention';
import { NewsPersonMention } from './NewsPersonMention';

export const NewsMention: FC<KkNewsTextMentionProps> = ({ mention }) => {
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
