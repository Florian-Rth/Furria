import { Timeline } from '@furria/studio/Timeline';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import type { FC } from 'react';
import { DESK_BRACKET, DESK_OVERVIEW_AIM } from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import { useDeskOverview } from '../hooks/use-desk-overview';

interface DeskOverviewProps {
  desk: ActDesk;
  centre: CentreScrub;
}

export const DeskOverview: FC<DeskOverviewProps> = ({ desk, centre }) => {
  const { playback } = desk.screen;
  const overview = useDeskOverview(desk, centre);

  return (
    <Timeline
      label={DESK_OVERVIEW_AIM}
      density="overview"
      length={playback.length}
      overview={overview.bracket}
    >
      <Timeline.Parts parts={overview.parts} tone={null} />
      <Timeline.Wave segments={playback.segments} peaks={playback.peaksByItem} />
      <Timeline.Bracket label={DESK_BRACKET} valueText={overview.bracketText} />
    </Timeline>
  );
};
