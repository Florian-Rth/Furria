import { DESK_BRACKET, DESK_OVERVIEW_AIM } from '@furria/studio/desk-copy';
import { Timeline } from '@furria/studio/Timeline';
import type { ActDesk } from '@furria/studio/use-act-desk';
import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { useDeskOverview } from '@furria/studio/use-desk-overview';
import type { FC } from 'react';

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
