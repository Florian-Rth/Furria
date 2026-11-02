import type { CentreScrub } from '@furria/studio/use-centre-scrub';
import { KkLaneOverview } from '@furria/ui/KkLaneOverview';
import type { FC } from 'react';
import { DESK_OVERVIEW, DESK_OVERVIEW_AIM } from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import { useDeskOverview } from '../hooks/use-desk-overview';
import { DeskOverviewWindow } from './DeskOverviewWindow';

interface DeskOverviewProps {
  desk: ActDesk;
  centre: CentreScrub;
}

export const DeskOverview: FC<DeskOverviewProps> = ({ desk, centre }) => {
  const overview = useDeskOverview(desk, centre);
  const bands = overview.bands.map((band) => (
    <KkLaneOverview.Band
      key={band.key}
      start={band.start}
      end={band.end}
      name={band.name}
      shade={band.shade}
      current={band.current}
    />
  ));

  return (
    <KkLaneOverview title={DESK_OVERVIEW} label={DESK_OVERVIEW_AIM} onAim={overview.aim}>
      <KkLaneOverview.Wave values={overview.wave} />
      {bands}
      <DeskOverviewWindow desk={desk} centre={centre} />
    </KkLaneOverview>
  );
};
