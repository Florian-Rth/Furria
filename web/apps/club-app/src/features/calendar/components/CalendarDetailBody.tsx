import { aspectRatioCss } from '@furria/ui/image-aspect';
import { KkButton } from '@furria/ui/KkButton';
import { KkCalendarAgenda } from '@furria/ui/KkCalendarAgenda';
import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkPhoto } from '@furria/ui/KkPhoto';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { ATTENDANCE_LABELS } from '@/lib/calendar-copy';
import { EDIT_LABEL, EVENT_LINK_LABEL, FACT_LABELS } from '../calendar-agenda-copy';
import { useCalendarDetail } from '../hooks/use-calendar-detail';
import type { CalendarEntry } from '../schemas';
import { CalendarGroupTags } from './CalendarGroupTags';

const BANNER = aspectRatioCss('banner');

interface CalendarDetailBodyProps {
  entry: CalendarEntry;
}

export const CalendarDetailBody: FC<CalendarDetailBodyProps> = ({ entry }) => {
  const { view, answer, editLink, eventLink } = useCalendarDetail(entry);

  const picture =
    view.cover === null ? null : (
      <KkPhoto
        alt=""
        image={view.cover.image}
        aspectRatio={BANNER}
        tone={view.cover.tone}
        stampLabel={view.cover.cancelledLabel}
      />
    );
  const venue =
    view.venue === null ? null : (
      <KkCalendarDetail.Fact icon="place" label={FACT_LABELS.where}>
        {view.venue}
      </KkCalendarDetail.Fact>
    );
  const eventFact =
    view.eventLine === null ? null : (
      <KkCalendarDetail.Fact icon="tickets" label={FACT_LABELS.event}>
        {view.eventLine}
      </KkCalendarDetail.Fact>
    );
  const text =
    view.text === null ? null : <KkCalendarDetail.Text>{view.text}</KkCalendarDetail.Text>;
  const choice =
    answer === null ? null : (
      <KkCalendarAgenda.Answer
        label={answer.label}
        value={answer.value}
        onChange={answer.choose}
        labels={ATTENDANCE_LABELS}
        error={answer.error}
        disabled={answer.disabled}
      />
    );
  const edit =
    editLink === null ? null : (
      <KkButton
        variant="outlined"
        size="small"
        component={Link}
        to={editLink.to}
        params={editLink.params}
        startIcon={<KkIcon name="edit" size="small" />}
      >
        {EDIT_LABEL}
      </KkButton>
    );
  const event =
    eventLink === null ? null : (
      <KkButton
        variant="outlined"
        size="small"
        component={Link}
        to={eventLink.to}
        params={eventLink.params}
        startIcon={<KkIcon name="tickets" size="small" />}
      >
        {EVENT_LINK_LABEL}
      </KkButton>
    );
  const links =
    edit === null && event === null ? null : (
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
        {edit}
        {event}
      </Stack>
    );
  const foot =
    choice === null && links === null ? null : (
      <KkCalendarDetail.Foot>
        {choice}
        {links}
      </KkCalendarDetail.Foot>
    );

  return (
    <KkCalendarDetail label={view.title}>
      <KkCalendarDetail.Body>
        <KkCalendarDetail.Head
          kind={view.glyph}
          kindLabel={view.kindLabel}
          title={view.title}
          when={view.when}
          liveLabel={view.liveLabel}
          mark={view.mark}
        />
        {picture}
        {text}
        <KkCalendarDetail.Facts>
          {venue}
          <KkCalendarDetail.Fact icon="group" label={FACT_LABELS.groups}>
            <CalendarGroupTags groups={view.groups} />
          </KkCalendarDetail.Fact>
          <KkCalendarDetail.Fact icon="visibility" label={FACT_LABELS.visibility}>
            {view.visibility}
          </KkCalendarDetail.Fact>
          {eventFact}
        </KkCalendarDetail.Facts>
      </KkCalendarDetail.Body>
      {foot}
    </KkCalendarDetail>
  );
};
