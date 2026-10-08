import { KkSection, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { EventTicketPanel } from '@/features/events/components/EventTicketPanel/EventTicketPanel';
import { TicketRequestCta } from '@/features/events/components/TicketRequestCta';
import { VenueBlock } from '@/features/events/components/VenueBlock';
import type { EventDetail } from '@/lib/public-events/schemas';
import { EventIdentityAside } from './internal/layout/EventIdentityAside';
import { EventIdentityLayout } from './internal/layout/EventIdentityLayout';
import { EventIdentityMain } from './internal/layout/EventIdentityMain';
import { EventClosingBand } from './internal/ui/EventClosingBand';
import { EventDetailBackLink } from './internal/ui/EventDetailBackLink';
import { EventDetailHeadline } from './internal/ui/EventDetailHeadline';
import { EventDetailIntro } from './internal/ui/EventDetailIntro';
import { EventDetailStats } from './internal/ui/EventDetailStats';
import { EventStickyCta } from './internal/ui/EventStickyCta';

interface EventDetailPageProps {
  event: EventDetail;
}

export const EventDetailPage: FC<EventDetailPageProps> = ({ event }) => (
  <PageLayout>
    <PageLayout.Body>
      <KkSection>
        <EventDetailBackLink />
        <EventIdentityLayout>
          <EventIdentityMain>
            <EventDetailHeadline event={event} />
            <EventDetailIntro event={event} />
            <EventDetailStats event={event} />
          </EventIdentityMain>
          <EventIdentityAside>
            <EventTicketPanel event={event} action={<TicketRequestCta event={event} />} />
          </EventIdentityAside>
        </EventIdentityLayout>
      </KkSection>
      <VenueBlock venue={event.venue} />
    </PageLayout.Body>
    <EventClosingBand event={event} />
    <EventStickyCta event={event} />
  </PageLayout>
);
