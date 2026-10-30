import { KkWayStep } from '@furria/ui/KkWayStep';
import { KkWayView } from '@furria/ui/KkWayView';
import { useWayDocked } from '@furria/ui/use-way-docked';
import type { FC } from 'react';
import type { Studio } from '@/features/acts/schemas';
import { useWayScreen } from '../hooks/use-way-screen';
import { WAY_LABEL } from '../way-copy';
import { WayCountLive } from './WayCountLive';
import { WayHero } from './WayHero';
import { WayKeys } from './WayKeys';
import { WayNoteSheet } from './WayNoteSheet';
import { WayPip } from './WayPip';
import { WayRibbon } from './WayRibbon';

interface WayBodyProps {
  actId: number;
  studio: Studio;
  viewerId: number | null;
}

export const WayBody: FC<WayBodyProps> = ({ actId, studio, viewerId }) => {
  const screen = useWayScreen(actId, studio, viewerId);
  const docked = useWayDocked();
  const { practice, playback } = screen;
  const dockedVideo = screen.hasVideos && docked;
  const floatingVideo = screen.hasVideos && !docked;
  const stageAlone = !floatingVideo;
  const count = screen.hasMusic ? (
    <WayCountLive player={playback.player} segments={playback.segments} />
  ) : null;
  const side = dockedVideo ? (
    <KkWayView.Side>
      <WayPip screen={screen} docked />
    </KkWayView.Side>
  ) : null;

  return (
    <KkWayView label={WAY_LABEL}>
      <KkWayView.Head>
        <KkWayStep.Titles
          stepKey={practice.stepKey}
          eyebrow={screen.eyebrow}
          name={practice.stepName}
        />
        {count}
      </KkWayView.Head>
      <KkWayView.Note>
        <KkWayStep.Note
          stepKey={practice.stepKey}
          text={screen.noteText}
          muted={screen.noteMuted}
          label={screen.noteLabel}
          onOpen={screen.openNote}
        />
      </KkWayView.Note>
      <KkWayView.Hero alone={stageAlone}>
        <WayHero screen={screen} floatingVideo={floatingVideo} />
      </KkWayView.Hero>
      <KkWayView.Ribbon>
        <WayRibbon screen={screen} />
      </KkWayView.Ribbon>
      {side}
      <KkWayView.Keys>
        <WayKeys screen={screen} />
      </KkWayView.Keys>
      <WayNoteSheet title={practice.stepName} eyebrow={screen.eyebrow} text={screen.noteText} />
    </KkWayView>
  );
};
