import { MENTION_KINDS } from '@furria/ui/rich-text';
import type { FC } from 'react';
import { RichText } from '@/features/rich-text/components/RichText';
import { mentionCardsOfTargets } from '@/features/rich-text/mention-cards';
import type { MentionTargets } from '@/features/rich-text/schemas';

interface AnnouncementTextProps {
  body: string;
  mentions: MentionTargets;
}

export const AnnouncementText: FC<AnnouncementTextProps> = ({ body, mentions }) => {
  const cards = mentionCardsOfTargets(mentions);

  return <RichText text={body} mentionKinds={MENTION_KINDS} cards={cards} density="compact" />;
};
