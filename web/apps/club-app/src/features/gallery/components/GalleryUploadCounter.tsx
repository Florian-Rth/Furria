import type { KkFlapCountTone, KkMetaTone } from '@furria/ui';
import { KkFlapCount, KkIcon, KkMeta } from '@furria/ui';
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
