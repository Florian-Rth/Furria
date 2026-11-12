import type { KkRichTextMentionProps } from '@furria/ui/rich-text-mention-view';
import type { FC } from 'react';
import { mentionCardOf } from '../mention-cards';
import { useMentionCards } from '../rich-text-mention-context';
import { RichTextGroupMention } from './RichTextGroupMention';
import { RichTextPersonMention } from './RichTextPersonMention';

export const RichTextMention: FC<KkRichTextMentionProps> = ({ mention }) => {
  const cards = useMentionCards();
  const card = mentionCardOf(mention, cards);

  if (card === null) {
    return mention.label;
  }
  if (card.kind === 'group') {
    return <RichTextGroupMention label={mention.label} group={card.group} />;
  }

  return <RichTextPersonMention label={mention.label} person={card.person} />;
};
