import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { toPersonsEmptyDescription } from '../manage-persons-labels';

const EMPTY_TITLE = 'NIEMAND GEFUNDEN';

interface PersonsEmptyProps {
  query: string;
  state: string;
}

export const PersonsEmpty: FC<PersonsEmptyProps> = ({ query, state }) => (
  <KkEmptyState title={EMPTY_TITLE} description={toPersonsEmptyDescription(query, state)} />
);
