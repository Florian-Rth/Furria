import type { KkFlapCountTone } from '@furria/ui/KkFlapCount';
import { KkFlapCount } from '@furria/ui/KkFlapCount';
import { KkIcon } from '@furria/ui/KkIcon';
import type { KkMetaTone } from '@furria/ui/KkMeta';
import { KkMeta } from '@furria/ui/KkMeta';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { UploadMood } from '../hooks/use-gallery-upload';

const COUNTER_TONES: Record<UploadMood, KkFlapCountTone> = {
  running: 'red',
  paused: 'gold',
  idle: 'ink',
};

const LINE_TONES: Record<UploadMood, KkMetaTone> = {
  running: 'muted',
  paused: 'accent',
  idle: 'muted',
};

interface GalleryUploadCounterProps {
  counter: string;
  statusLine: string;
  mood: UploadMood;
}

export const GalleryUploadCounter: FC<GalleryUploadCounterProps> = ({
  counter,
  statusLine,
  mood,
}) => {
  const icon = mood === 'paused' ? 'offline' : 'upload';

  return (
    <Stack sx={{ rowGap: 0.25 }}>
      <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 1 }}>
        <KkFlapCount value={counter} variant="h2" tone={COUNTER_TONES[mood]} />
        <KkIcon name={icon} size="small" />
      </Stack>
      <KkMeta tone={LINE_TONES[mood]}>{statusLine}</KkMeta>
    </Stack>
  );
};
