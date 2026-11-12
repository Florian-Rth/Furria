import { KkRichText } from '@furria/ui/KkRichText';
import type { MentionKind } from '@furria/ui/rich-text';
import type { FC } from 'react';
import type { MentionCards } from '../mention-cards';
import { NEW_TAB_NOTE } from '../rich-text-copy';
import { MentionCardsContext } from '../rich-text-mention-context';
import { RichTextMention } from './RichTextMention';

interface RichTextProps {
  text: string;
  mentionKinds: readonly MentionKind[];
  cards: MentionCards;
}

export const RichText: FC<RichTextProps> = ({ text, mentionKinds, cards }) => (
  <MentionCardsContext value={cards}>
    <KkRichText
      text={text}
      mentionKinds={mentionKinds}
      newTabNote={NEW_TAB_NOTE}
      mentionView={RichTextMention}
    />
  </MentionCardsContext>
);
