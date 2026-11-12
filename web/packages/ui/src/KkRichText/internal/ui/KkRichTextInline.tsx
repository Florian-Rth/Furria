import type { FC } from 'react';
import type { RichTextInline } from '../../../rich-text/rich-text-model';
import type { KkRichTextMentionView } from '../../rich-text-mention-view';
import { KkRichTextLink } from './KkRichTextLink';

interface KkRichTextInlineProps {
  inline: RichTextInline;
  newTabNote: string;
  mentionView: KkRichTextMentionView;
}

export const KkRichTextInline: FC<KkRichTextInlineProps> = ({
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
      <KkRichTextLink href={inline.href} note={newTabNote}>
        {inline.text}
      </KkRichTextLink>
    );
  return inline.bold ? <strong>{content}</strong> : content;
};
