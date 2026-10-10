import type { FC } from 'react';
import type { NewsInline } from '../../../news-text/news-text-model';
import type { KkNewsTextMentionView } from '../../news-text-mention-view';
import { KkNewsTextLink } from './KkNewsTextLink';

interface KkNewsTextInlineProps {
  inline: NewsInline;
  newTabNote: string;
  mentionView: KkNewsTextMentionView;
}

export const KkNewsTextInline: FC<KkNewsTextInlineProps> = ({
  inline,
  newTabNote,
  mentionView: MentionView,
}) => {
  const content =
    inline.kind === 'mention' ? (
      <MentionView mention={inline.mention} />
    ) : inline.href === null ? (
      inline.text
    ) : (
      <KkNewsTextLink href={inline.href} note={newTabNote}>
        {inline.text}
      </KkNewsTextLink>
    );
  return inline.bold ? <strong>{content}</strong> : content;
};
