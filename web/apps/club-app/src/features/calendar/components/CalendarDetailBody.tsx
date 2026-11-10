import { aspectRatioCss } from '@furria/ui/image-aspect';
import { KkButton } from '@furria/ui/KkButton';
import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import { KkIcon } from '@furria/ui/KkIcon';
import { KkPhoto } from '@furria/ui/KkPhoto';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toHeldAddOnKey } from '../calendar-add-ons';
import { EDIT_LABEL, EVENT_LINK_LABEL, FACT_LABELS } from '../calendar-agenda-copy';
import { useCalendarDetail } from '../hooks/use-calendar-detail';
import type { CalendarEntry } from '../schemas';
import { CalendarDetailAddOn } from './CalendarDetailAddOn';
import { CalendarGroupTags } from './CalendarGroupTags';
import { CalendarRunningOrderSection } from './CalendarRunningOrderSection';

const BANNER = aspectRatioCss('banner');

interface CalendarDetailBodyProps {
  entry: CalendarEntry;
}

export const CalendarDetailBody: FC<CalendarDetailBodyProps> = ({ entry }) => {
  const { view, answer, roll, editLink, mayModerate, eventLink } = useCalendarDetail(entry);

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
  const addOnSections = view.addOns.map((addOn) => {
    const key = toHeldAddOnKey(addOn);

    return (
      <CalendarDetailAddOn
        key={key}
        addOn={addOn}
        answer={answer}
        roll={roll}
        participatingGroups={view.participatingGroups}
        mayModerate={mayModerate}
        mayAnswer={entry.mayAnswer}
        startsAt={entry.startsAt}
        endsAt={entry.endsAt}
      />
    );
  });
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
  const foot = links === null ? null : <KkCalendarDetail.Foot>{links}</KkCalendarDetail.Foot>;

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
          <KkCalendarDetail.Fact icon="group" label={FACT_LABELS.owner}>
            <CalendarGroupTags groups={view.owner} />
          </KkCalendarDetail.Fact>
          <KkCalendarDetail.Fact icon="visibility" label={FACT_LABELS.audience}>
            {view.audience}
          </KkCalendarDetail.Fact>
          {eventFact}
        </KkCalendarDetail.Facts>
        {addOnSections}
        <CalendarRunningOrderSection entry={entry} />
      </KkCalendarDetail.Body>
      {foot}
    </KkCalendarDetail>
  );
};
