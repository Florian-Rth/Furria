import type { FC } from 'react';
import type { RichTextBlock } from '../../../rich-text/rich-text-model';
import type { KkRichTextMentionView } from '../../rich-text-mention-view';
import { KkRichTextInlines } from './KkRichTextInlines';

interface KkRichTextBlockProps {
  block: RichTextBlock;
  newTabNote: string;
  mentionView: KkRichTextMentionView;
}

export const KkRichTextBlock: FC<KkRichTextBlockProps> = ({ block, newTabNote, mentionView }) => {
  if (block.kind === 'list') {
    return (
      <ul>
        {block.items.map((item, index) => (
          <li key={`${index}-${item.length}`}>
            <KkRichTextInlines inlines={item} newTabNote={newTabNote} mentionView={mentionView} />
          </li>
        ))}
      </ul>
    );
  }
  const inlines = (
    <KkRichTextInlines inlines={block.inlines} newTabNote={newTabNote} mentionView={mentionView} />
  );
  return block.kind === 'heading' ? <h2>{inlines}</h2> : <p>{inlines}</p>;
};
