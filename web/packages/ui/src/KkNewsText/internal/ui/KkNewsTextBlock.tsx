import type { FC } from 'react';
import type { NewsBlock } from '../../../news-text/news-text-model';
import type { KkNewsTextMentionView } from '../../news-text-mention-view';
import { KkNewsTextInlines } from './KkNewsTextInlines';

interface KkNewsTextBlockProps {
  block: NewsBlock;
  newTabNote: string;
  mentionView: KkNewsTextMentionView;
}

export const KkNewsTextBlock: FC<KkNewsTextBlockProps> = ({ block, newTabNote, mentionView }) => {
  if (block.kind === 'list') {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li key={`${index}-${item.length}`}>
            <KkNewsTextInlines inlines={item} newTabNote={newTabNote} mentionView={mentionView} />
          </li>
        ))}
      </ul>
    );
  }
  const inlines = (
    <KkNewsTextInlines inlines={block.inlines} newTabNote={newTabNote} mentionView={mentionView} />
  );
  return block.kind === 'heading' ? <h2>{inlines}</h2> : <p>{inlines}</p>;
};
