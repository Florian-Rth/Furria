import { sessionAt } from '@/lib/club';
import { formatSessionNumber } from '@/lib/membership-labels';

const AREA_LABEL = 'MITGLIEDERBEREICH';
const TOWN_LABEL = 'GROSSFURRA';
const META_SEPARATOR = ' · ';

export interface LoginStageMeta {
  place: string;
  session: string;
}

export const buildLoginStageMeta = (now: Date): LoginStageMeta => {
  const session = sessionAt(now);

  return {
    place: `${AREA_LABEL}${META_SEPARATOR}${TOWN_LABEL}`,
    session: `SESSION ${session.yearsLabel}${META_SEPARATOR}${formatSessionNumber(session.number)}`,
  };
};
