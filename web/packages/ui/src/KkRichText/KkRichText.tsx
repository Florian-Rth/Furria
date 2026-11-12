import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { richTextPaint } from '../internal/rich-text-paint';
import type { KkSx } from '../kk-sx';
import { readRichText } from '../rich-text/read-rich-text';
import type { MentionKind } from '../rich-text/rich-text-model';
import { KkRichTextBlock } from './internal/ui/KkRichTextBlock';
import { KkRichTextMentionLabel } from './internal/ui/KkRichTextMentionLabel';
import type { KkRichTextMentionView } from './rich-text-mention-view';

interface KkRichTextProps {
  text: string;
  mentionKinds: readonly MentionKind[];
  newTabNote: string;
  mentionView?: KkRichTextMentionView;
  sx?: KkSx;
}

export const KkRichText: FC<KkRichTextProps> = ({
  text,
  mentionKinds,
  newTabNote,
  mentionView = KkRichTextMentionLabel,
  sx,
}) => {
  const blocks = readRichText(text, mentionKinds);

  return (
    <Box
      component="section"
      data-kk-rich-text
      sx={[
        (theme: Theme) => ({ ...richTextPaint(theme), '& > :last-child': { marginBottom: 0 } }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {blocks.map((block, index) => (
        <KkRichTextBlock
          key={`${index}-${block.kind}`}
          block={block}
          newTabNote={newTabNote}
          mentionView={mentionView}
        />
      ))}
    </Box>
  );
};
