import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { usePlaybackSeconds } from '@furria/studio/use-playback-seconds';
import { KkLaneOverview } from '@furria/ui/KkLaneOverview';
import type { FC } from 'react';
import { DESK_BRACKET } from '../desk-copy';
import { shareOf } from '../desk-time';
import type { ActDesk } from '../hooks/use-act-desk';
import { useDeskWindow } from '../hooks/use-desk-window';

interface DeskOverviewWindowProps {
  desk: ActDesk;
  centre: CentreScrub;
}

export const DeskOverviewWindow: FC<DeskOverviewWindowProps> = ({ desk, centre }) => {
  const { player, length } = desk.screen.playback;
  const control = useDeskWindow(centre, length);
  const playhead = shareOf(usePlaybackSeconds(player), length);

  if (length <= 0) {
    return null;
  }

  return (
    <>
      <KkLaneOverview.Bracket
        start={control.start}
        end={control.end}
        label={DESK_BRACKET}
        valueText={control.valueText}
        onGrab={control.grab}
        onPan={control.pan}
        onEdge={control.edge}
        onRelease={control.release}
        onKey={control.key}
      />
      <KkLaneOverview.Playhead share={playhead} />
    </>
  );
};
