import { KkSection, PageLayout } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import { EventTicketPanel } from '@/features/events/components/EventTicketPanel/EventTicketPanel';
import { VenueBlock } from '@/features/events/components/VenueBlock';
import type { Event } from '@/lib/seed/events';
import { EventIdentityAside } from './internal/layout/EventIdentityAside';
import { EventIdentityLayout } from './internal/layout/EventIdentityLayout';
import { EventIdentityMain } from './internal/layout/EventIdentityMain';
import { EventClosingBand } from './internal/ui/EventClosingBand';
import { EventDetailBackLink } from './internal/ui/EventDetailBackLink';
import { EventDetailHeadline } from './internal/ui/EventDetailHeadline';
import { EventDetailIntro } from './internal/ui/EventDetailIntro';
import { EventDetailStats } from './internal/ui/EventDetailStats';
import { EventPerformers } from './internal/ui/EventPerformers';
import { EventStickyCta } from './internal/ui/EventStickyCta';

interface EventDetailPageProps {
  event: Event;
  albumPreview?: ReactNode;
}

export const EventDetailPage: FC<EventDetailPageProps> = ({ event, albumPreview }) => (
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
            <EventTicketPanel event={event} />
          </EventIdentityAside>
        </EventIdentityLayout>
      </KkSection>
      <EventPerformers event={event} />
      {albumPreview}
      <VenueBlock />
    </PageLayout.Body>
    <EventClosingBand event={event} />
    <EventStickyCta event={event} />
  </PageLayout>
);
