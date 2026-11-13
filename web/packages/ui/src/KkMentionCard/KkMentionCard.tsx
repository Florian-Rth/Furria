import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkPictureUrls } from '../image-source';
import type { KkGroupTone } from '../internal/group-tone';
import { KkMentionFacts } from './internal/ui/KkMentionFacts';
import { KkMentionGroupFace } from './internal/ui/KkMentionGroupFace';
import { KkMentionPortrait } from './internal/ui/KkMentionPortrait';

export type KkMentionCardFace =
  | { kind: 'group'; tone: KkGroupTone | null }
  | { kind: 'person' }
  | { kind: 'plain' };

interface KkMentionCardProps {
  face: KkMentionCardFace;
  name: string;
  line: string;
  initials?: string;
  picture?: KkPictureUrls | null;
  action?: ReactNode;
}

export const KkMentionCard: FC<KkMentionCardProps> = ({
  face,
  name,
  line,
  initials = '',
  picture = null,
  action = null,
}) => {
  const facts = <KkMentionFacts name={name} line={line} action={action} />;

  if (face.kind === 'plain') {
    return (
      <Stack data-kk-mention-card="plain" sx={{ p: 2 }}>
        {facts}
      </Stack>
    );
  }
  if (face.kind === 'group') {
    return (
      <Stack data-kk-mention-card="group">
        <KkMentionGroupFace initials={initials} tone={face.tone} picture={picture} />
        <Stack sx={{ p: 2 }}>{facts}</Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="row"
      data-kk-mention-card="person"
      sx={{ p: 2, gap: 1.5, alignItems: 'center' }}
    >
      <KkMentionPortrait initials={initials} picture={picture} />
      {facts}
    </Stack>
  );
};
