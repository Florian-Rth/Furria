import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { PersonHelpViewer } from '../hooks/use-person-help-viewer';
import { PERSON_HELP_COPY, PERSON_HELP_SPOTS } from '../person-help-copy';
import { PersonHelpAppPreview } from './PersonHelpAppPreview';
import { PersonHelpMembershipPreview } from './PersonHelpMembershipPreview';

interface PersonHelpProps {
  viewer: PersonHelpViewer;
}

export const PersonHelp: FC<PersonHelpProps> = ({ viewer }) => {
  const managed = viewer.managesPersons;
  const memberships = managed ? (
    <KkHelp.Hint>
      <KkHelp.Preview>
        <PersonHelpMembershipPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{PERSON_HELP_COPY.memberships.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_HELP_COPY.memberships.text}</KkHelp.Text>
      <KkHelp.Text>{PERSON_HELP_COPY.memberships.pauses}</KkHelp.Text>
      <KkHelp.Text>{PERSON_HELP_COPY.memberships.groups}</KkHelp.Text>
      <ScreenHelpShow spot={PERSON_HELP_SPOTS.memberships} />
    </KkHelp.Hint>
  ) : null;
  const feeReductionsArchived = viewer.isArchived ? (
    <KkHelp.Text>{PERSON_HELP_COPY.feeReductions.archived}</KkHelp.Text>
  ) : null;
  const feeReductionsShow = viewer.showsFeeReductions ? (
    <ScreenHelpShow spot={PERSON_HELP_SPOTS.feeReductions} />
  ) : null;
  const feeReductions = managed ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_HELP_COPY.feeReductions.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_HELP_COPY.feeReductions.text}</KkHelp.Text>
      {feeReductionsArchived}
      {feeReductionsShow}
    </KkHelp.Hint>
  ) : null;
  const tiesShow = viewer.showsTies ? <ScreenHelpShow spot={PERSON_HELP_SPOTS.ties} /> : null;
  const ties = managed ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_HELP_COPY.ties.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_HELP_COPY.ties.text}</KkHelp.Text>
      <KkHelp.Text>{PERSON_HELP_COPY.ties.where}</KkHelp.Text>
      {tiesShow}
    </KkHelp.Hint>
  ) : null;
  const whatsApp = viewer.keepsClubGroup ? (
    <KkHelp.Text>{PERSON_HELP_COPY.masterData.whatsApp}</KkHelp.Text>
  ) : null;
  const masterData = managed ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_HELP_COPY.masterData.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_HELP_COPY.masterData.text}</KkHelp.Text>
      <KkHelp.Text>{PERSON_HELP_COPY.masterData.visibility}</KkHelp.Text>
      {whatsApp}
      <ScreenHelpShow spot={PERSON_HELP_SPOTS.masterData} />
    </KkHelp.Hint>
  ) : null;
  const restoreHint = (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_HELP_COPY.restore.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_HELP_COPY.restore.text}</KkHelp.Text>
    </KkHelp.Hint>
  );
  const archiveHint = (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_HELP_COPY.archive.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_HELP_COPY.archive.text}</KkHelp.Text>
      <KkHelp.Text>{PERSON_HELP_COPY.archive.keeps}</KkHelp.Text>
    </KkHelp.Hint>
  );
  const archiveOrRestore = viewer.isArchived ? restoreHint : archiveHint;
  const archive = managed ? archiveOrRestore : null;
  const recovery = viewer.managesAccounts ? (
    <KkHelp.Text>{PERSON_HELP_COPY.app.recovery}</KkHelp.Text>
  ) : null;
  const invitations = managed ? (
    <>
      <KkHelp.Text>{PERSON_HELP_COPY.app.text}</KkHelp.Text>
      <KkHelp.Text>{PERSON_HELP_COPY.app.single}</KkHelp.Text>
    </>
  ) : null;
  const appPreview = managed ? (
    <KkHelp.Preview>
      <PersonHelpAppPreview />
    </KkHelp.Preview>
  ) : null;
  const deletion = viewer.deletesPersons ? (
    <KkHelp.Hint>
      <KkHelp.Title>{PERSON_HELP_COPY.delete.title}</KkHelp.Title>
      <KkHelp.Text>{PERSON_HELP_COPY.delete.text}</KkHelp.Text>
      <KkHelp.Text>{PERSON_HELP_COPY.delete.proof}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const overviewNext = managed ? <KkHelp.Text>{PERSON_HELP_COPY.overview.next}</KkHelp.Text> : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Title>{PERSON_HELP_COPY.overview.title}</KkHelp.Title>
        <KkHelp.Text>{PERSON_HELP_COPY.overview.text}</KkHelp.Text>
        {overviewNext}
      </KkHelp.Hint>
      <KkHelp.Hint>
        {appPreview}
        <KkHelp.Title>{PERSON_HELP_COPY.app.title}</KkHelp.Title>
        <KkHelp.Text>{PERSON_HELP_COPY.app.state}</KkHelp.Text>
        {invitations}
        {recovery}
        <ScreenHelpShow spot={PERSON_HELP_SPOTS.app} />
      </KkHelp.Hint>
      {masterData}
      {memberships}
      {feeReductions}
      {ties}
      {archive}
      {deletion}
    </ScreenHelp>
  );
};
