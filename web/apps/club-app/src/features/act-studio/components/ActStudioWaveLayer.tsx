import { KkStudioWave } from '@furria/ui/KkStudioWave';
import type { FC } from 'react';
import { useActStudioWave } from '../hooks/use-act-studio-wave';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_WAVE_LABEL } from '../studio-copy';
import { ActStudioPlayheadLive } from './ActStudioPlayheadLive';

interface ActStudioWaveLayerProps {
  screen: StudioScreen;
}

export const ActStudioWaveLayer: FC<ActStudioWaveLayerProps> = ({ screen }) => {
  const wave = useActStudioWave(screen);
  const regions = wave.regions.map((region) => (
    <KkStudioWave.Region
      key={region.key}
      start={region.start}
      end={region.end}
      number={region.number}
      name={region.name}
      meta={region.meta}
      selected={region.selected}
    />
  ));
  const handles = wave.handles.map((handle) => (
    <KkStudioWave.Handle
      key={handle.key}
      share={handle.share}
      edge={handle.edge}
      label={handle.label}
      active={handle.active}
      onMove={handle.move}
      onEnd={handle.end}
    />
  ));
  const cut =
    wave.cut === null ? null : <KkStudioWave.Cut start={wave.cut.start} end={wave.cut.end} />;

  return (
    <KkStudioWave label={STUDIO_WAVE_LABEL} onScrub={wave.scrub}>
      {regions}
      <KkStudioWave.Bars values={wave.bars} />
      <KkStudioWave.Beats beats={wave.beats} />
      <KkStudioWave.Ticks ticks={wave.ticks} />
      {cut}
      {handles}
      <ActStudioPlayheadLive
        player={screen.playback.player}
        start={0}
        end={screen.playback.length}
      />
    </KkStudioWave>
  );
};
