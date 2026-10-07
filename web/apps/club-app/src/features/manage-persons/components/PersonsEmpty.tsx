import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import type { PersonAccessFilter } from '../person-access-filter';
import { toPersonsEmptyLine } from '../person-access-filter';

const EMPTY_TITLE = 'NIEMAND GEFUNDEN';

interface PersonsEmptyProps {
  query: string;
  state: string;
  access: PersonAccessFilter | null;
  isArchivedView: boolean;
}

export const PersonsEmpty: FC<PersonsEmptyProps> = ({ query, state, access, isArchivedView }) => {
  const description = toPersonsEmptyLine(query, state, access, isArchivedView);

  return (
    <KkPanel variant="block">
      <KkEmptyState title={EMPTY_TITLE} description={description} />
    </KkPanel>
  );
};
