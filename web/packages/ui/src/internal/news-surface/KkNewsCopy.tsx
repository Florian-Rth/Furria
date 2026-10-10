import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkNewsProofing } from './news-proofing';
import { useNewsProofing } from './news-proofing';

export type KkNewsCopyKind = 'title' | 'teaser';

const PLACEHOLDERS: Record<KkNewsCopyKind, (proofing: KkNewsProofing) => string> = {
  title: (proofing) => proofing.untitled,
  teaser: (proofing) => proofing.teaserPlaceholder,
};

interface KkNewsCopyProps {
  text: string | null;
  kind: KkNewsCopyKind;
}

export const KkNewsCopy: FC<KkNewsCopyProps> = ({ text, kind }) => {
  const proofing = useNewsProofing();

  if (text !== null) {
    return text;
  }
  if (proofing === null) {
    return null;
  }

  return (
    <Box component="span" data-kk-news-blank sx={{ color: 'text.disabled' }}>
      {PLACEHOLDERS[kind](proofing)}
    </Box>
  );
};
