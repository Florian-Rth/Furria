import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { HUB_HELP_ADMIN_CHIP, HUB_HELP_COPY, HUB_HELP_SPOTS } from '../group-hub-help-copy';
import type { HubHelpViewer } from '../hooks/use-hub-help-viewer';
import { HubHelpActPreview } from './HubHelpActPreview';
import { HubHelpCalendarPreview } from './HubHelpCalendarPreview';
import { HubHelpPeoplePreview } from './HubHelpPeoplePreview';
import { HubHelpRhythmPreview } from './HubHelpRhythmPreview';

interface GroupHubHelpProps {
  viewer: HubHelpViewer;
}

export const GroupHubHelp: FC<GroupHubHelpProps> = ({ viewer }) => {
  const usualTimesManage = viewer.manages ? (
    <KkHelp.Text>{HUB_HELP_COPY.usualTimes.manage}</KkHelp.Text>
  ) : null;
  const calendarManage = viewer.manages ? (
    <KkHelp.Text>{HUB_HELP_COPY.calendar.manage}</KkHelp.Text>
  ) : null;
  const actsManage = viewer.managesActs ? (
    <KkHelp.Text>{HUB_HELP_COPY.acts.manage}</KkHelp.Text>
  ) : null;
  const peopleManage = viewer.manages ? (
    <KkHelp.Text>{HUB_HELP_COPY.people.manage}</KkHelp.Text>
  ) : null;
  const peopleIntake = viewer.startsIntakes ? (
    <KkHelp.Text>{HUB_HELP_COPY.people.intake}</KkHelp.Text>
  ) : null;

  const calendar = viewer.seesCalendar ? (
    <KkHelp.Hint>
      <KkHelp.Preview>
        <HubHelpCalendarPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{HUB_HELP_COPY.calendar.title}</KkHelp.Title>
      <KkHelp.Text>{HUB_HELP_COPY.calendar.text}</KkHelp.Text>
      {calendarManage}
      <ScreenHelpShow spot={HUB_HELP_SPOTS.calendar} />
    </KkHelp.Hint>
  ) : null;

  const acts = viewer.seesActs ? (
    <KkHelp.Hint>
      <KkHelp.Preview>
        <HubHelpActPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{HUB_HELP_COPY.acts.title}</KkHelp.Title>
      <KkHelp.Text>{HUB_HELP_COPY.acts.text}</KkHelp.Text>
      {actsManage}
      <ScreenHelpShow spot={HUB_HELP_SPOTS.acts} />
    </KkHelp.Hint>
  ) : null;

  const settings = viewer.manages ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={HUB_HELP_ADMIN_CHIP}>{HUB_HELP_COPY.settings.title}</KkHelp.Title>
      <KkHelp.Text>{HUB_HELP_COPY.settings.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  const history = viewer.seesHistory ? (
    <KkHelp.Hint>
      <KkHelp.Title chip={HUB_HELP_ADMIN_CHIP}>{HUB_HELP_COPY.history.title}</KkHelp.Title>
      <KkHelp.Text>{HUB_HELP_COPY.history.text}</KkHelp.Text>
      <ScreenHelpShow spot={HUB_HELP_SPOTS.history} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <HubHelpRhythmPreview tone={viewer.tone} />
        </KkHelp.Preview>
        <KkHelp.Title>{HUB_HELP_COPY.usualTimes.title}</KkHelp.Title>
        <KkHelp.Text>{HUB_HELP_COPY.usualTimes.text}</KkHelp.Text>
        {usualTimesManage}
        <ScreenHelpShow spot={HUB_HELP_SPOTS.usualTimes} />
      </KkHelp.Hint>
      {calendar}
      {acts}
      <KkHelp.Hint>
        <KkHelp.Preview>
          <HubHelpPeoplePreview tone={viewer.tone} />
        </KkHelp.Preview>
        <KkHelp.Title>{HUB_HELP_COPY.people.title}</KkHelp.Title>
        <KkHelp.Text>{HUB_HELP_COPY.people.text}</KkHelp.Text>
        {peopleManage}
        {peopleIntake}
        <ScreenHelpShow spot={HUB_HELP_SPOTS.people} />
      </KkHelp.Hint>
      {settings}
      {history}
    </ScreenHelp>
  );
};
