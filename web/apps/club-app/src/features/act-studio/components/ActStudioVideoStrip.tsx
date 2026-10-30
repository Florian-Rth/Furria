import { KkStudioPlacement } from '@furria/ui/KkStudioPlacement';
import type { FC } from 'react';
import type { ActStudioTakes } from '../hooks/use-act-studio-takes';
import type { StudioScreen } from '../hooks/use-studio-screen';
import { STUDIO_EARLIER, STUDIO_LATER_NUDGE, STUDIO_PLACEMENT_LABEL } from '../studio-copy';
import { ActStudioPlayheadLive } from './ActStudioPlayheadLive';

interface ActStudioVideoStripProps {
  screen: StudioScreen;
  takes: ActStudioTakes;
}

export const ActStudioVideoStrip: FC<ActStudioVideoStripProps> = ({ screen, takes }) => {
  const earlier = (): void => {
    takes.nudge('earlier');
  };
  const later = (): void => {
    takes.nudge('later');
  };
  const parts = takes.parts.map((part) => (
    <KkStudioPlacement.Part key={part.key} start={part.start} end={part.end} name={part.name} />
  ));
  const bars = takes.bars.map((bar) => (
    <KkStudioPlacement.Bar
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
    <KkStudioPlacement label={STUDIO_PLACEMENT_LABEL}>
      <KkStudioPlacement.Head>
        <KkStudioPlacement.Text text={takes.text} accent={takes.changed} />
      </KkStudioPlacement.Head>
      <KkStudioPlacement.Row>
        <KkStudioPlacement.Nudge
          direction="earlier"
          label={STUDIO_EARLIER}
          disabled={!takes.canNudge}
          onNudge={earlier}
        />
        <KkStudioPlacement.Track>
          {parts}
          {bars}
          <ActStudioPlayheadLive
            player={screen.playback.player}
            start={0}
            end={screen.playback.length}
          />
        </KkStudioPlacement.Track>
        <KkStudioPlacement.Nudge
          direction="later"
          label={STUDIO_LATER_NUDGE}
          disabled={!takes.canNudge}
          onNudge={later}
        />
      </KkStudioPlacement.Row>
    </KkStudioPlacement>
  );
};
