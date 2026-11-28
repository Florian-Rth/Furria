import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { CALENDAR_HELP_COPY, CALENDAR_HELP_SPOTS } from '../calendar-help-copy';
import type { CalendarHelpViewer } from '../hooks/use-calendar-help-viewer';
import { CalendarHelpAnswerPreview } from './CalendarHelpAnswerPreview';
import { CalendarHelpDetailPreview } from './CalendarHelpDetailPreview';
import { CalendarHelpMarksPreview } from './CalendarHelpMarksPreview';
import { CalendarHelpUsualPreview } from './CalendarHelpUsualPreview';
import { CalendarHelpWeekPreview } from './CalendarHelpWeekPreview';

interface CalendarHelpProps {
  viewer: CalendarHelpViewer;
}

export const CalendarHelp: FC<CalendarHelpProps> = ({ viewer }) => {
  const overview = viewer.isWide ? (
    <KkHelp.Hint>
      <KkHelp.Title>{CALENDAR_HELP_COPY.month.title}</KkHelp.Title>
      <KkHelp.Text>{CALENDAR_HELP_COPY.month.text}</KkHelp.Text>
      <KkHelp.Text>{CALENDAR_HELP_COPY.month.marks}</KkHelp.Text>
      <ScreenHelpShow spot={CALENDAR_HELP_SPOTS.month} />
    </KkHelp.Hint>
  ) : (
    <KkHelp.Hint>
      <KkHelp.Preview>
        <CalendarHelpWeekPreview />
      </KkHelp.Preview>
      <KkHelp.Title>{CALENDAR_HELP_COPY.week.title}</KkHelp.Title>
      <KkHelp.Text>{CALENDAR_HELP_COPY.week.text}</KkHelp.Text>
      <KkHelp.Text>{CALENDAR_HELP_COPY.week.marks}</KkHelp.Text>
      <KkHelp.Text>{CALENDAR_HELP_COPY.week.more}</KkHelp.Text>
      <ScreenHelpShow spot={CALENDAR_HELP_SPOTS.week} />
    </KkHelp.Hint>
  );

  const detailEdit = viewer.mayAuthor ? (
    <KkHelp.Text>{CALENDAR_HELP_COPY.detail.edit}</KkHelp.Text>
  ) : null;
  const detailMark = viewer.mayAuthor ? (
    <KkHelp.Text>{CALENDAR_HELP_COPY.detail.mark}</KkHelp.Text>
  ) : null;
  const usualPlan = viewer.mayPlan ? (
    <KkHelp.Text>{CALENDAR_HELP_COPY.usual.plan}</KkHelp.Text>
  ) : null;

  const add = viewer.mayAuthor ? (
    <KkHelp.Hint>
      <KkHelp.Title>{CALENDAR_HELP_COPY.add.title}</KkHelp.Title>
      <KkHelp.Text>{CALENDAR_HELP_COPY.add.text}</KkHelp.Text>
      <KkHelp.Text>{CALENDAR_HELP_COPY.add.addOns}</KkHelp.Text>
    </KkHelp.Hint>
  ) : null;

  return (
    <ScreenHelp>
      {overview}
      <KkHelp.Hint>
        <KkHelp.Preview>
          <CalendarHelpAnswerPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{CALENDAR_HELP_COPY.answers.title}</KkHelp.Title>
        <KkHelp.Text>{CALENDAR_HELP_COPY.answers.text}</KkHelp.Text>
        <KkHelp.Text>{CALENDAR_HELP_COPY.answers.after}</KkHelp.Text>
        <ScreenHelpShow spot={CALENDAR_HELP_SPOTS.day} />
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <CalendarHelpMarksPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{CALENDAR_HELP_COPY.openMarks.title}</KkHelp.Title>
        <KkHelp.Text>{CALENDAR_HELP_COPY.openMarks.text}</KkHelp.Text>
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <CalendarHelpDetailPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{CALENDAR_HELP_COPY.detail.title}</KkHelp.Title>
        <KkHelp.Text>{CALENDAR_HELP_COPY.detail.text}</KkHelp.Text>
        {detailEdit}
        {detailMark}
      </KkHelp.Hint>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <CalendarHelpUsualPreview mayPlan={viewer.mayPlan} />
        </KkHelp.Preview>
        <KkHelp.Title>{CALENDAR_HELP_COPY.usual.title}</KkHelp.Title>
        <KkHelp.Text>{CALENDAR_HELP_COPY.usual.text}</KkHelp.Text>
        {usualPlan}
        <ScreenHelpShow spot={CALENDAR_HELP_SPOTS.usual} />
      </KkHelp.Hint>
      {add}
    </ScreenHelp>
  );
};
