import type { FC } from 'react';
import { BackLink } from '@/components/BackLink';
import { eventBackLinkLabel } from '@/features/events/event-detail-content';

export const EventDetailBackLink: FC = () => <BackLink to="/events">{eventBackLinkLabel}</BackLink>;
