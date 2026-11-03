import { ActStudioWaveReadout } from '@furria/studio/ActStudioWaveReadout';
import { STUDIO_WAVE_LABEL } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { Timeline } from '@furria/studio/Timeline';
import { useActStudioWave } from '@furria/studio/use-act-studio-wave';
import type { FC } from 'react';

interface ActStudioWaveLayerProps {
  screen: StudioScreen;
}

export const ActStudioWaveLayer: FC<ActStudioWaveLayerProps> = ({ screen }) => {
  const wave = useActStudioWave(screen);
  const { playback } = screen;
  const readout = <ActStudioWaveReadout readout={wave.readout} />;

  return (
    <Timeline
      label={STUDIO_WAVE_LABEL}
      density="edit"
      length={playback.length}
      centre={wave.centre}
      overlay={readout}
      sx={{
        position: 'absolute',
        inset: 0,
        mx: { xs: 1.5, desktop: 2.5 },
        my: { xs: 1.5, desktop: 2 },
      }}
    >
      <Timeline.Regions regions={wave.regions} />
      <Timeline.Counts marks={playback.countMarks} />
      <Timeline.Wave segments={playback.segments} peaks={playback.peaksByItem} />
      <Timeline.Ticks steps={wave.ticks} activeKey={wave.currentStepId} />
      <Timeline.Trim range={wave.trim} />
      <Timeline.Snap />
      <Timeline.Handles handles={wave.handles} />
    </Timeline>
  );
};
