import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { MEMBERSHIP_HELP_COPY, MEMBERSHIP_HELP_SPOTS } from '../person-membership-help-copy';

interface PersonMembershipHelpProps {
  isEditing: boolean;
  isArchived: boolean;
}

export const PersonMembershipHelp: FC<PersonMembershipHelpProps> = ({ isEditing, isArchived }) => {
  const end = isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title>{MEMBERSHIP_HELP_COPY.end.title}</KkHelp.Title>
      <KkHelp.Text>{MEMBERSHIP_HELP_COPY.end.text}</KkHelp.Text>
      <KkHelp.Text>{MEMBERSHIP_HELP_COPY.end.keeps}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const pauses = isEditing ? (
    <KkHelp.Hint>
      <KkHelp.Title>{MEMBERSHIP_HELP_COPY.pauses.title}</KkHelp.Title>
      <KkHelp.Text>{MEMBERSHIP_HELP_COPY.pauses.text}</KkHelp.Text>
      <KkHelp.Text>{MEMBERSHIP_HELP_COPY.pauses.edit}</KkHelp.Text>
      <ScreenHelpShow spot={MEMBERSHIP_HELP_SPOTS.pauses} />
    </KkHelp.Hint>
  ) : null;
  const archived = isArchived ? (
    <KkHelp.Hint>
      <KkHelp.Title>{MEMBERSHIP_HELP_COPY.archived.title}</KkHelp.Title>
      <KkHelp.Text>{MEMBERSHIP_HELP_COPY.archived.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const saving = isEditing ? MEMBERSHIP_HELP_COPY.save.edit : MEMBERSHIP_HELP_COPY.save.create;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{MEMBERSHIP_HELP_COPY.span.title}</KkHelp.Title>
        <KkHelp.Text>{MEMBERSHIP_HELP_COPY.span.text}</KkHelp.Text>
        <KkHelp.Text>{MEMBERSHIP_HELP_COPY.span.chain}</KkHelp.Text>
        <ScreenHelpShow spot={MEMBERSHIP_HELP_SPOTS.span} />
      </KkHelp.Hint>
      {end}
      {pauses}
      {archived}
      <KkHelp.Hint>
        <KkHelp.Title>{MEMBERSHIP_HELP_COPY.save.title}</KkHelp.Title>
        <KkHelp.Text>{saving}</KkHelp.Text>
        <KkHelp.Text>{MEMBERSHIP_HELP_COPY.save.leave}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
