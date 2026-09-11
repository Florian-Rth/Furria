import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { toEmptyDescription } from '../members-labels';

const EMPTY_TITLE = 'NIEMAND GEFUNDEN';

interface MembersEmptyProps {
  query: string;
}

export const MembersEmpty: FC<MembersEmptyProps> = ({ query }) => (
  <KkEmptyState icon="search" title={EMPTY_TITLE} description={toEmptyDescription(query)} />
);
