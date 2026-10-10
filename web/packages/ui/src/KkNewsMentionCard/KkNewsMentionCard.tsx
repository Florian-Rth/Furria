import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkGroupTone } from '../internal/group-tone';
import type { KkPictureUrls } from '../picture-sources';
import { KkNewsMentionFacts } from './internal/ui/KkNewsMentionFacts';
import { KkNewsMentionGroupFace } from './internal/ui/KkNewsMentionGroupFace';
import { KkNewsMentionPortrait } from './internal/ui/KkNewsMentionPortrait';

export type KkNewsMentionCardFace =
  | { kind: 'group'; tone: KkGroupTone | null }
  | { kind: 'person' };

interface KkNewsMentionCardProps {
  face: KkNewsMentionCardFace;
  name: string;
  line: string;
  initials: string;
  picture: KkPictureUrls | null;
  action?: ReactNode;
}

export const KkNewsMentionCard: FC<KkNewsMentionCardProps> = ({
  face,
  name,
  line,
  initials,
  picture,
  action = null,
}) => {
  const facts = <KkNewsMentionFacts name={name} line={line} action={action} />;

  if (face.kind === 'group') {
    return (
      <Stack data-kk-news-mention-card="group">
        <KkNewsMentionGroupFace initials={initials} tone={face.tone} picture={picture} />
        <Stack sx={{ p: 2 }}>{facts}</Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      data-kk-news-mention-card="person"
      sx={{ p: 2, gap: 1.5, alignItems: 'center' }}
    >
      <KkNewsMentionPortrait initials={initials} picture={picture} />
      {facts}
    </Stack>
  );
};
