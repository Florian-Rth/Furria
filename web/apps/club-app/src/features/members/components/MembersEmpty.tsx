import { KkEmptyState, KkPanel } from '@furria/ui';
import type { FC } from 'react';
import { toEmptyDescription } from '../members-labels';

const EMPTY_TITLE = 'NIEMAND GEFUNDEN';

interface MembersEmptyProps {
  query: string;
  state: string;
}

export const MembersEmpty: FC<MembersEmptyProps> = ({ query, state }) => (
  <KkPanel variant="block">
    <KkEmptyState title={EMPTY_TITLE} description={toEmptyDescription(query, state)} />
  </KkPanel>
);
