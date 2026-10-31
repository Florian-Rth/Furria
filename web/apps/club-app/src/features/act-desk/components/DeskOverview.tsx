import { KkLaneOverview } from '@furria/ui/KkLaneOverview';
import type { FC } from 'react';
import { DESK_OVERVIEW, DESK_OVERVIEW_AIM } from '../desk-copy';
import type { ActDesk } from '../hooks/use-act-desk';
import { useDeskOverview } from '../hooks/use-desk-overview';
import type { DeskZoom } from '../hooks/use-desk-zoom';
import { DeskOverviewWindow } from './DeskOverviewWindow';

interface DeskOverviewProps {
  desk: ActDesk;
  zoom: DeskZoom;
}

export const DeskOverview: FC<DeskOverviewProps> = ({ desk, zoom }) => {
  const overview = useDeskOverview(desk, zoom);
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
      <DeskOverviewWindow desk={desk} zoom={zoom} />
    </KkLaneOverview>
  );
};
