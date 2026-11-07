import { KkIconButton } from '@furria/ui/KkIconButton';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkMeta } from '@furria/ui/KkMeta';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { BorderTune } from '../hooks/use-setup-borders';
import { SS_TUNE_GROUP, SS_TUNE_NEXT, SS_TUNE_NONE, SS_TUNE_PREVIOUS } from '../setup-copy';
import { SsToolButton } from './SsToolButton';

interface SsBorderTuneProps {
  tune: BorderTune | null;
}

const ignore = (): void => undefined;

export const SsBorderTune: FC<SsBorderTuneProps> = ({ tune }) => {
  if (tune === null) {
    return <KkMeta>{SS_TUNE_NONE}</KkMeta>;
  }

  const firstBorder = tune.previous === null;
  const lastBorder = tune.next === null;
  const previous = tune.previous ?? ignore;
  const next = tune.next ?? ignore;

  return (
    <Stack role="group" aria-label={SS_TUNE_GROUP} sx={{ gap: 0.5, minWidth: 0 }}>
      <KkMeta>{tune.title}</KkMeta>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <KkLaneButton
          text={SS_TUNE_PREVIOUS}
          glyph="left"
          textShown={false}
          disabled={firstBorder}
          onPress={previous}
        />
        <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
          <SsToolButton tool={tune.earlier} wide />
        </Box>
        <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
          <SsToolButton tool={tune.later} wide />
        </Box>
        <KkIconButton label={tune.remove.text} icon="delete" onClick={tune.remove.press} />
        <KkLaneButton
          text={SS_TUNE_NEXT}
          glyph="right"
          textShown={false}
          disabled={lastBorder}
          onPress={next}
        />
      </Stack>
    </Stack>
  );
};
