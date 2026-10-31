import { KkLaneOverview } from '@furria/ui/KkLaneOverview';
import type { FC } from 'react';
import { usePlaybackSeconds } from '@/features/act-player/hooks/use-playback-seconds';
import { DESK_BRACKET } from '../desk-copy';
import { shareOf } from '../desk-time';
import type { ActDesk } from '../hooks/use-act-desk';
import { useDeskWindow } from '../hooks/use-desk-window';
import type { DeskZoom } from '../hooks/use-desk-zoom';

interface DeskOverviewWindowProps {
  desk: ActDesk;
  zoom: DeskZoom;
}

export const DeskOverviewWindow: FC<DeskOverviewWindowProps> = ({ desk, zoom }) => {
  const { player, length } = desk.screen.playback;
  const control = useDeskWindow(zoom, length);
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
