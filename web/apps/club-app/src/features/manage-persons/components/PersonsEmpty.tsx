import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { PersonAccessFilter } from '../person-access-filter';
import { toPersonsEmptyLine } from '../person-access-filter';

const EMPTY_TITLE = 'NIEMAND GEFUNDEN';

interface PersonsEmptyProps {
  query: string;
  state: string;
  access: PersonAccessFilter | null;
}

export const PersonsEmpty: FC<PersonsEmptyProps> = ({ query, state, access }) => (
  <KkPanel variant="block">
    <KkEmptyState title={EMPTY_TITLE} description={toPersonsEmptyLine(query, state, access)} />
  </KkPanel>
);
