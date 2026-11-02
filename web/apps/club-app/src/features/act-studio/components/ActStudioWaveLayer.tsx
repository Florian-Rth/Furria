import { Timeline } from '@furria/studio/Timeline';
import type { FC } from 'react';
import { useActStudioWave } from '../hooks/use-act-studio-wave';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_WAVE_LABEL } from '../studio-copy';
import { ActStudioWaveReadout } from './ActStudioWaveReadout';

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
