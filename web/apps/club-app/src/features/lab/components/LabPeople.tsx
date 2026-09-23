import { KkPersonRow } from '@furria/ui';
import type { FC } from 'react';
import { LAB_PEOPLE } from '../lab-people';

export const LabPeople: FC = () =>
  LAB_PEOPLE.map((person) => (
    <KkPersonRow
      key={person.name}
      initials={person.initials}
      name={person.name}
      meta={person.meta}
    />
  ));
