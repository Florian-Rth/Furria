import { KkStudioBManual } from '@furria/ui/KkStudioBManual';
import { KkStudioBVideo } from '@furria/ui/KkStudioBVideo';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useStudioBVideo } from '../hooks/use-studio-b-video';
import { useStudioB } from '../studio-b-context';
import { MIRRORED_LABEL, NO_DESCRIPTION, NO_VIDEO_LABEL } from '../studio-b-copy';
import type { ManualStep } from '../studio-b-manual';
import { StudioBLiveCount } from './StudioBLiveCount';
import { StudioBLiveStage } from './StudioBLiveStage';

const SIDE_BY_SIDE = { xs: 12, sm: 6 } as const;
const STACKED = { xs: 12 } as const;
const COLUMN = { gap: 1.5, minWidth: 0 } as const;

interface StudioBCardMediaProps {
  step: ManualStep;
  aside: boolean;
  fallbackName: string;
}

export const StudioBCardMedia: FC<StudioBCardMediaProps> = ({ step, aside, fallbackName }) => {
  const { studio, playback, practice } = useStudioB();
  const video = useStudioBVideo(playback, studio, fallbackName);
  const span = aside ? SIDE_BY_SIDE : STACKED;
  const shownVideo =
    video.source === null && !aside ? null : (
      <KkStudioBVideo
        source={video.source}
        mirrored={practice.mirrored}
        mirroredLabel={MIRRORED_LABEL}
        emptyLabel={NO_VIDEO_LABEL}
        videoRef={video.ref}
      />
    );
  const practiceLines = (
    <>
      <StudioBLiveCount step={step} />
      <KkStudioBManual.Note
        noteKey={String(step.stepId)}
        text={step.description ?? NO_DESCRIPTION}
        quiet={step.description === null}
      />
    </>
  );
  const besideVideo = aside ? practiceLines : null;
  const belowStage = aside ? null : practiceLines;

  return (
    <Grid container spacing={1.5}>
      <Grid size={span}>
        <Stack sx={COLUMN}>
          {shownVideo}
          {besideVideo}
        </Stack>
      </Grid>
      <Grid size={span}>
        <Stack sx={COLUMN}>
          <StudioBLiveStage />
          {belowStage}
        </Stack>
      </Grid>
    </Grid>
  );
};
