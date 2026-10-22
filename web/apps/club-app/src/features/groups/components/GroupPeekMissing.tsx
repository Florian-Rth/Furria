import { KkEmptyState } from '@furria/ui/KkEmptyState';
import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import { toPeekId } from '@/lib/peek';
import { GROUP_PEEK_CLOSE_LABEL } from '../groups-labels';

const MISSING_TITLE = 'Gruppe nicht gefunden';
const MISSING_HEADLINE = 'GRUPPE NICHT GEFUNDEN';
const MISSING_DESCRIPTION = 'Diese Gruppe gibt es nicht mehr oder sie wurde archiviert.';

interface GroupPeekMissingProps {
  groupId: number;
}

export const GroupPeekMissing: FC<GroupPeekMissingProps> = ({ groupId }) => (
  <KkSheet
    id={toPeekId('group', groupId)}
    title={MISSING_TITLE}
    closeLabel={GROUP_PEEK_CLOSE_LABEL}
  >
    <KkSheet.Body>
      <KkEmptyState title={MISSING_HEADLINE} description={MISSING_DESCRIPTION} />
    </KkSheet.Body>
  </KkSheet>
);
