import { KkStudioIWave } from '@furria/ui/KkStudioIWave';
import type { FC } from 'react';
import type { MixPlayer } from '@/features/act-player/mix-player';
import type { StudioIWaveView as WaveModel } from '../hooks/use-studio-i-wave';
import { StudioIPlayheadLive } from './StudioIPlayheadLive';

interface StudioIWaveViewProps {
  wave: WaveModel;
  player: MixPlayer;
}

export const StudioIWaveView: FC<StudioIWaveViewProps> = ({ wave, player }) => {
  const seams = wave.seams.map((seam) => (
    <KkStudioIWave.Seam key={seam.key} share={seam.share} label={seam.label} />
  ));
  const marks = wave.marks.map((mark) => (
    <KkStudioIWave.Mark
      key={mark.edge}
      share={mark.share}
      edge={mark.edge}
      text={mark.text}
      label={mark.label}
      selected={mark.selected}
      movable={mark.movable}
      onPress={mark.press}
      onDrag={mark.drag}
    />
  ));

  return (
    <KkStudioIWave label={wave.label}>
      <KkStudioIWave.Bars bars={wave.bars} from={wave.from} to={wave.to} />
      <KkStudioIWave.Shade from={wave.from} to={wave.to} />
      <KkStudioIWave.Ticks ticks={wave.ticks} numbers={wave.numbers} />
      {seams}
      <KkStudioIWave.Band pieces={wave.band} />
      <KkStudioIWave.Edge side="start" text={wave.before} />
      <KkStudioIWave.Edge side="end" text={wave.after} />
      {marks}
      <StudioIPlayheadLive player={player} window={wave.window} />
    </KkStudioIWave>
  );
};
