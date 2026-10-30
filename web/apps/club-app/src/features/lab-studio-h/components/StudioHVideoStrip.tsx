import { KkStudioHPlacement } from '@furria/ui/KkStudioHPlacement';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import type { StudioHTakes } from '../hooks/use-studio-h-takes';
import { STUDIO_H_EARLIER, STUDIO_H_LATER_NUDGE, STUDIO_H_PLACEMENT_LABEL } from '../studio-h-copy';
import { StudioHPlayheadLive } from './StudioHPlayheadLive';

interface StudioHVideoStripProps {
  h: StudioH;
  takes: StudioHTakes;
}

export const StudioHVideoStrip: FC<StudioHVideoStripProps> = ({ h, takes }) => {
  const earlier = (): void => {
    takes.nudge('earlier');
  };
  const later = (): void => {
    takes.nudge('later');
  };
  const parts = takes.parts.map((part) => (
    <KkStudioHPlacement.Part key={part.key} start={part.start} end={part.end} name={part.name} />
  ));
  const bars = takes.bars.map((bar) => (
    <KkStudioHPlacement.Bar
      key={bar.key}
      start={bar.start}
      end={bar.end}
      label={bar.label}
      selected={bar.selected}
      onPress={bar.press}
      onMove={bar.move}
      onEnd={bar.finish}
    />
  ));

  return (
    <KkStudioHPlacement label={STUDIO_H_PLACEMENT_LABEL}>
      <KkStudioHPlacement.Head>
        <KkStudioHPlacement.Text text={takes.text} accent={takes.changed} />
      </KkStudioHPlacement.Head>
      <KkStudioHPlacement.Row>
        <KkStudioHPlacement.Nudge
          direction="earlier"
          label={STUDIO_H_EARLIER}
          disabled={!takes.canNudge}
          onNudge={earlier}
        />
        <KkStudioHPlacement.Track>
          {parts}
          {bars}
          <StudioHPlayheadLive player={h.playback.player} start={0} end={h.playback.length} />
        </KkStudioHPlacement.Track>
        <KkStudioHPlacement.Nudge
          direction="later"
          label={STUDIO_H_LATER_NUDGE}
          disabled={!takes.canNudge}
          onNudge={later}
        />
      </KkStudioHPlacement.Row>
    </KkStudioHPlacement>
  );
};
