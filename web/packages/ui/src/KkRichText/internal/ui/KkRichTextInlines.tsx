import type { FC } from 'react';
import type { RichTextInline } from '../../../rich-text/rich-text-model';
import type { KkRichTextMentionView } from '../../rich-text-mention-view';
import { KkRichTextInline } from './KkRichTextInline';

interface KkRichTextInlinesProps {
  inlines: readonly RichTextInline[];
  newTabNote: string;
  mentionView: KkRichTextMentionView;
}

export const KkRichTextInlines: FC<KkRichTextInlinesProps> = ({
  inlines,
  newTabNote,
  mentionView,
}) =>
  inlines.map((inline, index) => (
    <KkRichTextInline
      key={`${index}-${inline.kind}`}
      inline={inline}
      newTabNote={newTabNote}
      mentionView={mentionView}
    />
  ));
