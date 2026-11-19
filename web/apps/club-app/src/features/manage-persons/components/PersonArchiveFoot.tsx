import type { FC } from 'react';
import type { PersonDetails } from '../schemas';
import { PersonArchiveLine } from './PersonArchiveLine';
import { PersonRestoreLine } from './PersonRestoreLine';

interface PersonArchiveFootProps {
  person: PersonDetails;
}

export const PersonArchiveFoot: FC<PersonArchiveFootProps> = ({ person }) =>
  person.archive === null ? (
    <PersonArchiveLine person={person} />
  ) : (
    <PersonRestoreLine person={person} archive={person.archive} />
  );
