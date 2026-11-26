import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import type { StartHelpViewer } from '../hooks/use-start-help-viewer';
import { START_HELP_COPY, START_HELP_SPOTS } from '../start-help-copy';
import { StartHelpCalendarPreview } from './StartHelpCalendarPreview';

interface StartHelpProps {
  viewer: StartHelpViewer;
}

export const StartHelp: FC<StartHelpProps> = ({ viewer }) => {
  const { panels } = viewer;

  const head = viewer.greets ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.head.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.head.text}</KkHelp.Text>
      <KkHelp.Text>{START_HELP_COPY.head.facts}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const allowMotion = viewer.asksForMotion ? (
    <KkHelp.Text>{START_HELP_COPY.confetti.allow}</KkHelp.Text>
  ) : null;
  const confetti = viewer.shakes ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.confetti.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.confetti.text}</KkHelp.Text>
      {allowMotion}
    </KkHelp.Hint>
  ) : null;
  const clubGroup = viewer.invitesToClubGroup ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.clubGroup.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.clubGroup.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const week = viewer.showsWeek ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.week.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.week.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const calendar = panels.has('calendar') ? (
    <>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <StartHelpCalendarPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{START_HELP_COPY.calendar.title}</KkHelp.Title>
        <KkHelp.Text>{START_HELP_COPY.calendar.text}</KkHelp.Text>
        <KkHelp.Text>{START_HELP_COPY.calendar.marks}</KkHelp.Text>
        <KkHelp.Text>{START_HELP_COPY.calendar.more}</KkHelp.Text>
        <ScreenHelpShow spot={START_HELP_SPOTS.calendar} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Title>{START_HELP_COPY.ring.title}</KkHelp.Title>
        <KkHelp.Text>{START_HELP_COPY.ring.text}</KkHelp.Text>
        <KkHelp.Text>{START_HELP_COPY.ring.tap}</KkHelp.Text>
        <KkHelp.Text>{START_HELP_COPY.ring.done}</KkHelp.Text>
      </KkHelp.Hint>
    </>
  ) : null;
  const announcements = panels.has('announcements') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.announcements.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.announcements.text}</KkHelp.Text>
      <KkHelp.Text>{START_HELP_COPY.announcements.more}</KkHelp.Text>
      <ScreenHelpShow spot={START_HELP_SPOTS.announcements} />
    </KkHelp.Hint>
  ) : null;
  const mine = panels.has('mine') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.mine.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.mine.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const practice = panels.has('practice') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.practice.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.practice.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const news = panels.has('news') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.news.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.news.text}</KkHelp.Text>
      <KkHelp.Text>{START_HELP_COPY.news.more}</KkHelp.Text>
      <ScreenHelpShow spot={START_HELP_SPOTS.news} />
    </KkHelp.Hint>
  ) : null;
  const gallery = panels.has('gallery') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.gallery.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.gallery.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const groups = panels.has('groups') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.groups.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.groups.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const beerTab = panels.has('beerTab') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.beerTab.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.beerTab.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const beerDesk = panels.has('beerDesk') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.beerDesk.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.beerDesk.text}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;
  const toDos = panels.has('toDos') ? (
    <KkHelp.Hint>
      <KkHelp.Title>{START_HELP_COPY.toDos.title}</KkHelp.Title>
      <KkHelp.Text>{START_HELP_COPY.toDos.text}</KkHelp.Text>
      <ScreenHelpShow spot={START_HELP_SPOTS.toDos} />
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      {head}
      {confetti}
      {clubGroup}
      {week}
      {calendar}
      {announcements}
      {toDos}
      {mine}
      {practice}
      {news}
      {gallery}
      {groups}
      {beerTab}
      {beerDesk}
    </ScreenHelp>
  );
};
