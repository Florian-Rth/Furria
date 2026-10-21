import { KkStartTile } from '@furria/ui';
import type { FC } from 'react';
import type { CalendarLeadView } from '../hooks/use-calendar-tile';
import { EntryMark } from './EntryMark';

interface CalendarLeadProps {
  lead: CalendarLeadView;
}

export const CalendarLead: FC<CalendarLeadProps> = ({ lead }) => (
  <KkStartTile.Lead
    image={lead.image}
    tone={lead.tone}
    icon={lead.icon}
    eyebrow={lead.eyebrow}
    eyebrowTone={lead.eyebrowTone}
    time={lead.time}
    title={lead.title}
    meta={lead.meta}
    progress={lead.progress}
    trailing={<EntryMark mark={lead.mark} />}
    label={lead.label}
    onClick={lead.open}
  />
);
