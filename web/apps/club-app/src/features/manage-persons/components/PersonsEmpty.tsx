import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { toPersonsEmptyDescription } from '../manage-persons-labels';

const EMPTY_TITLE = 'NIEMAND GEFUNDEN';

interface PersonsEmptyProps {
  query: string;
}

export const PersonsEmpty: FC<PersonsEmptyProps> = ({ query }) => (
  <KkEmptyState icon="search" title={EMPTY_TITLE} description={toPersonsEmptyDescription(query)} />
);
