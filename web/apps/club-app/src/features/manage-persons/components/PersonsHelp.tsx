import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { PERSONS_HELP_COPY, PERSONS_HELP_SPOTS } from '../persons-help-copy';
import { PersonsHelpRowPreview } from './PersonsHelpRowPreview';

interface PersonsHelpProps {
  managesPersons: boolean;
}

export const PersonsHelp: FC<PersonsHelpProps> = ({ managesPersons }) => {
  const add = managesPersons ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSONS_HELP_COPY.add.title}</KkHelp.Title>
      <KkHelp.Text>{PERSONS_HELP_COPY.add.text}</KkHelp.Text>
      <KkHelp.Text>{PERSONS_HELP_COPY.add.intakes}</KkHelp.Text>
      <ScreenHelpShow spot={PERSONS_HELP_SPOTS.intakes} />
    </KkHelp.Hint>
  ) : null;
  const rounds = managesPersons ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSONS_HELP_COPY.rounds.title}</KkHelp.Title>
      <KkHelp.Text>{PERSONS_HELP_COPY.rounds.invite}</KkHelp.Text>
      <KkHelp.Text>{PERSONS_HELP_COPY.rounds.remind}</KkHelp.Text>
      <KkHelp.Text>{PERSONS_HELP_COPY.rounds.noMail}</KkHelp.Text>
      <ScreenHelpShow spot={PERSONS_HELP_SPOTS.register} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{PERSONS_HELP_COPY.find.title}</KkHelp.Title>
        <KkHelp.Text>{PERSONS_HELP_COPY.find.text}</KkHelp.Text>
        <KkHelp.Text>{PERSONS_HELP_COPY.find.filter}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <PersonsHelpRowPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{PERSONS_HELP_COPY.rows.title}</KkHelp.Title>
        <KkHelp.Text>{PERSONS_HELP_COPY.rows.text}</KkHelp.Text>
        <KkHelp.Text>{PERSONS_HELP_COPY.rows.withheld}</KkHelp.Text>
        <ScreenHelpShow spot={PERSONS_HELP_SPOTS.register} />
      </KkHelp.Hint>
      {add}
      {rounds}
      <KkHelp.Hint>
        <KkHelp.Title>{PERSONS_HELP_COPY.stats.title}</KkHelp.Title>
        <KkHelp.Text>{PERSONS_HELP_COPY.stats.text}</KkHelp.Text>
      </KkHelp.Hint>
    </ScreenHelp>
  );
};
