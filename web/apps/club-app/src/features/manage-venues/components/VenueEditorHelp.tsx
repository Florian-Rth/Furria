import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { VENUE_EDITOR_HELP_COPY, VENUE_EDITOR_HELP_SPOTS } from '../venues-help-copy';

interface VenueEditorHelpProps {
  isEditing: boolean;
}

export const VenueEditorHelp: FC<VenueEditorHelpProps> = ({ isEditing }) => {
  const saving = isEditing ? VENUE_EDITOR_HELP_COPY.save.edit : VENUE_EDITOR_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{VENUE_EDITOR_HELP_COPY.place.title}</KkHelp.Title>
        <KkHelp.Text>{VENUE_EDITOR_HELP_COPY.place.text}</KkHelp.Text>
        <ScreenHelpShow spot={VENUE_EDITOR_HELP_SPOTS.place} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{VENUE_EDITOR_HELP_COPY.address.title}</KkHelp.Title>
        <KkHelp.Text>{VENUE_EDITOR_HELP_COPY.address.text}</KkHelp.Text>
        <KkHelp.Text>{VENUE_EDITOR_HELP_COPY.address.hint}</KkHelp.Text>
        <ScreenHelpShow spot={VENUE_EDITOR_HELP_SPOTS.address} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{VENUE_EDITOR_HELP_COPY.openingHours.title}</KkHelp.Title>
        <KkHelp.Text>{VENUE_EDITOR_HELP_COPY.openingHours.text}</KkHelp.Text>
        <KkHelp.Text>{VENUE_EDITOR_HELP_COPY.openingHours.rules}</KkHelp.Text>
        <ScreenHelpShow spot={VENUE_EDITOR_HELP_SPOTS.openingHours} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{VENUE_EDITOR_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
