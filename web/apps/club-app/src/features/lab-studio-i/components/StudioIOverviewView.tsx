import { KkStudioIOverview } from '@furria/ui/KkStudioIOverview';
import type { FC } from 'react';
import type { StudioIOverviewView as OverviewModel } from '../hooks/use-studio-i-overview';
import { StudioIOverviewExtras } from './StudioIOverviewExtras';

interface StudioIOverviewViewProps {
  overview: OverviewModel;
  full: boolean;
}

export const StudioIOverviewView: FC<StudioIOverviewViewProps> = ({ overview, full }) => {
  const songs = overview.songs.map((song) => (
    <KkStudioIOverview.Song
      key={song.key}
      number={song.number}
      name={song.name}
      meta={song.meta}
      cut={song.cut}
      from={song.from}
      to={song.to}
    />
  ));
  const spots = overview.spots.map((spot) => (
    <KkStudioIOverview.Spot key={spot.key} number={spot.number} name={spot.name} open={spot.open} />
  ));
  const extras = full ? <StudioIOverviewExtras overview={overview} /> : null;

  return (
    <KkStudioIOverview label={overview.label}>
      <KkStudioIOverview.Section label={overview.songsTitle}>
        <KkStudioIOverview.Head title={overview.songsTitle} meta={overview.songsMeta} />
        {songs}
      </KkStudioIOverview.Section>
      <KkStudioIOverview.Section label={overview.spotsTitle}>
        <KkStudioIOverview.Head title={overview.spotsTitle} meta={overview.spotsMeta} />
        <KkStudioIOverview.Spots>{spots}</KkStudioIOverview.Spots>
      </KkStudioIOverview.Section>
      {extras}
    </KkStudioIOverview>
  );
};
