import { KkStudioHWave } from '@furria/ui/KkStudioHWave';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import { useStudioHWave } from '../hooks/use-studio-h-wave';
import { STUDIO_H_WAVE_LABEL } from '../studio-h-copy';
import { StudioHPlayheadLive } from './StudioHPlayheadLive';

interface StudioHWaveLayerProps {
  h: StudioH;
}

export const StudioHWaveLayer: FC<StudioHWaveLayerProps> = ({ h }) => {
  const wave = useStudioHWave(h);
  const regions = wave.regions.map((region) => (
    <KkStudioHWave.Region
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
    <KkStudioHWave.Handle
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
    wave.cut === null ? null : <KkStudioHWave.Cut start={wave.cut.start} end={wave.cut.end} />;

  return (
    <KkStudioHWave label={STUDIO_H_WAVE_LABEL} onScrub={wave.scrub}>
      {regions}
      <KkStudioHWave.Bars values={wave.bars} />
      <KkStudioHWave.Ticks ticks={wave.ticks} />
      {cut}
      {handles}
      <StudioHPlayheadLive player={h.playback.player} start={0} end={h.playback.length} />
    </KkStudioHWave>
  );
};
