import type { KkNewsTextMentionProps } from '@furria/ui/news-text-mention-view';
import type { FC } from 'react';
import { mentionCardOf } from '../read-news';
import { useReadNewsMentionCards } from '../read-news-mention-context';
import { ReadNewsGroupMention } from './ReadNewsGroupMention';
import { ReadNewsPersonMention } from './ReadNewsPersonMention';

export const ReadNewsMention: FC<KkNewsTextMentionProps> = ({ mention }) => {
  const cards = useReadNewsMentionCards();
  const card = mentionCardOf(mention, cards);

  if (card === null) {
    return mention.label;
  }
  if (card.kind === 'group') {
    return <ReadNewsGroupMention label={mention.label} group={card.group} />;
  }

  return <ReadNewsPersonMention label={mention.label} person={card.person} />;
};
