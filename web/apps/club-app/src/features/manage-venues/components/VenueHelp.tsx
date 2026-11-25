import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { VenueHelpViewer } from '../hooks/use-venue-help-viewer';
import { VENUE_HELP_COPY, VENUE_HELP_SPOTS } from '../venues-help-copy';

interface VenueHelpProps {
  viewer: VenueHelpViewer;
}

export const VenueHelp: FC<VenueHelpProps> = ({ viewer }) => {
  const halls = viewer.drawsHalls ? (
    <KkHelp.Hint>
      <KkHelp.Title>{VENUE_HELP_COPY.halls.title}</KkHelp.Title>
      <KkHelp.Text>{VENUE_HELP_COPY.halls.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{VENUE_HELP_COPY.address.title}</KkHelp.Title>
        <KkHelp.Text>{VENUE_HELP_COPY.address.text}</KkHelp.Text>
        <KkHelp.Text>{VENUE_HELP_COPY.address.edit}</KkHelp.Text>
        <ScreenHelpShow spot={VENUE_HELP_SPOTS.address} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{VENUE_HELP_COPY.openingHours.title}</KkHelp.Title>
        <KkHelp.Text>{VENUE_HELP_COPY.openingHours.text}</KkHelp.Text>
        <ScreenHelpShow spot={VENUE_HELP_SPOTS.openingHours} />
      </KkHelp.Hint>
      {halls}
      <KkHelp.Hint>
        <KkHelp.Title>{VENUE_HELP_COPY.archive.title}</KkHelp.Title>
        <KkHelp.Text>{VENUE_HELP_COPY.archive.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
