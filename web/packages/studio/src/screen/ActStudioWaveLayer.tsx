import { ActStudioWaveReadout } from '@furria/studio/ActStudioWaveReadout';
import { StudioTimeline } from '@furria/studio/StudioTimeline';
import { STUDIO_WAVE_LABEL } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { useActStudioWave } from '@furria/studio/use-act-studio-wave';
import type { FC } from 'react';

interface ActStudioWaveLayerProps {
  screen: StudioScreen;
}

export const ActStudioWaveLayer: FC<ActStudioWaveLayerProps> = ({ screen }) => {
  const wave = useActStudioWave(screen);
  const { playback, practice } = screen;
  const readout = <ActStudioWaveReadout readout={wave.readout} />;
  const parts = { parts: wave.rows.parts, tone: screen.tone };
  const music = {
    segments: playback.segments,
    peaks: playback.peaksByItem,
    counts: playback.countMarks,
    cuts: true,
    regions: wave.regions,
    trim: wave.trim,
    handles: wave.handles,
  };
  const steps = { steps: wave.rows.steps, activeKey: practice.step?.stepId ?? null };

  return (
    <StudioTimeline
      label={STUDIO_WAVE_LABEL}
      density="edit"
      length={playback.length}
      centre={wave.centre}
      ruler
      parts={parts}
      wave={music}
      steps={steps}
      overlay={readout}
      sx={{
        position: 'absolute',
        inset: 0,
        mx: { xs: 1.5, desktop: 2.5 },
        my: { xs: 1.5, desktop: 2 },
      }}
    />
  );
};
