import { KkHeroSection } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import { deriveHeroIntro, deriveSessionEyebrow } from '@/features/events/hero-display';
import type { Event } from '@/lib/seed/events';
import { EventsHeroStats } from './EventsHeroStats';

interface EventsHeroProps {
  events: Event[];
  now: Date;
  aside?: ReactNode;
}

export const EventsHero: FC<EventsHeroProps> = ({ events, now, aside }) => {
  const eyebrow = deriveSessionEyebrow(events, now);
  const intro = deriveHeroIntro(events);

  const introLine =
    intro === null ? null : <KkHeroSection.Description>{intro}</KkHeroSection.Description>;

  const asideSlot = aside === undefined ? null : <KkHeroSection.Aside>{aside}</KkHeroSection.Aside>;

  return (
    <KkHeroSection>
      <KkHeroSection.Main>
        <KkHeroSection.Eyebrow>{eyebrow}</KkHeroSection.Eyebrow>
        <KkHeroSection.Title>VERANSTALTUNGEN</KkHeroSection.Title>
        {introLine}
        <EventsHeroStats events={events} />
      </KkHeroSection.Main>
      {asideSlot}
    </KkHeroSection>
  );
};
