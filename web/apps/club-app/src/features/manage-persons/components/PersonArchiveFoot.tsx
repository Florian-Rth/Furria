import { KkNote } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { toArchiveBlockedLine, toRunningTies } from '../person-archive';
import type { PersonDetails } from '../schemas';
import { PersonArchiveLine } from './PersonArchiveLine';
import { PersonRestoreLine } from './PersonRestoreLine';

interface PersonArchiveFootProps {
  person: PersonDetails;
}

export const PersonArchiveFoot: FC<PersonArchiveFootProps> = ({ person }) => {
  const runningTies = toRunningTies(person, toIsoDay(new Date()));

  if (person.archive !== null) {
    return <PersonRestoreLine person={person} archive={person.archive} />;
  }
  if (runningTies.length > 0) {
    return <KkNote>{toArchiveBlockedLine(runningTies)}</KkNote>;
  }

  return <PersonArchiveLine person={person} />;
};
