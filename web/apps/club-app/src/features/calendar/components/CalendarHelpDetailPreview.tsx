import { KkCalendarDetail } from '@furria/ui/KkCalendarDetail';
import type { FC } from 'react';
import { FACT_LABELS } from '../calendar-agenda-copy';

const SAMPLE_TITLE = 'Training';
const SAMPLE_KIND = 'Training';
const SAMPLE_WHEN = 'Di 24.11. · 19:00 – 21:00 Uhr';
const SAMPLE_VENUE = 'Turnhalle';
const SAMPLE_AUDIENCE = 'Tanzgarde';

export const CalendarHelpDetailPreview: FC = () => (
  <KkCalendarDetail label={SAMPLE_TITLE}>
    <KkCalendarDetail.Body>
      <KkCalendarDetail.Head
        kind="training"
        kindLabel={SAMPLE_KIND}
        title={SAMPLE_TITLE}
        when={SAMPLE_WHEN}
        liveLabel={null}
        mark="club"
      />
      <KkCalendarDetail.Facts>
        <KkCalendarDetail.Fact icon="place" label={FACT_LABELS.where}>
          {SAMPLE_VENUE}
        </KkCalendarDetail.Fact>
        <KkCalendarDetail.Fact icon="visibility" label={FACT_LABELS.audience}>
          {SAMPLE_AUDIENCE}
        </KkCalendarDetail.Fact>
      </KkCalendarDetail.Facts>
    </KkCalendarDetail.Body>
  </KkCalendarDetail>
);
