import type { FC } from 'react';
import type { NewsInline } from '../../../news-text/news-text-model';
import type { KkNewsTextMentionView } from '../../news-text-mention-view';
import { KkNewsTextInline } from './KkNewsTextInline';

interface KkNewsTextInlinesProps {
  inlines: readonly NewsInline[];
  newTabNote: string;
  mentionView: KkNewsTextMentionView;
}

export const KkNewsTextInlines: FC<KkNewsTextInlinesProps> = ({
  inlines,
  newTabNote,
  mentionView,
}) =>
  inlines.map((inline, index) => (
    <KkNewsTextInline
      key={`${index}-${inline.kind}`}
      inline={inline}
      newTabNote={newTabNote}
      mentionView={mentionView}
    />
  ));
