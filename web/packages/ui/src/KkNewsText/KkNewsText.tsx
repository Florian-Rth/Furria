import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { newsTextPaint } from '../internal/news-text-paint';
import type { KkSx } from '../kk-sx';
import { readNewsText } from '../news-text/read-news-text';
import { KkNewsTextBlock } from './internal/ui/KkNewsTextBlock';
import { KkNewsTextMentionLabel } from './internal/ui/KkNewsTextMentionLabel';
import type { KkNewsTextMentionView } from './news-text-mention-view';

interface KkNewsTextProps {
  text: string;
  newTabNote: string;
  mentionView?: KkNewsTextMentionView;
  sx?: KkSx;
}

export const KkNewsText: FC<KkNewsTextProps> = ({
  text,
  newTabNote,
  mentionView = KkNewsTextMentionLabel,
  sx,
}) => {
  const blocks = readNewsText(text);

  return (
    <Box
      component="section"
      data-kk-news-text
      sx={[
        (theme: Theme) => ({ ...newsTextPaint(theme), '& > :last-child': { marginBottom: 0 } }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {blocks.map((block, index) => (
        <KkNewsTextBlock
          key={`${index}-${block.kind}`}
          block={block}
          newTabNote={newTabNote}
          mentionView={mentionView}
        />
      ))}
    </Box>
  );
};
