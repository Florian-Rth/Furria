import { sessionAt } from '@/lib/club';

const AREA_LABEL = 'MITGLIEDERBEREICH';
const TOWN_LABEL = 'GROSSFURRA';

export interface LoginStageMeta {
  place: string;
  number: string;
  session: string;
}

export const buildLoginStageMeta = (now: Date): LoginStageMeta => {
  const session = sessionAt(now);

  return {
    place: `${AREA_LABEL} · ${TOWN_LABEL}`,
    number: `NUMBER ${session.number}`,
    session: `SESSION ${session.yearsLabel}`,
  };
};
