import { KkPanel, KkSwitchRow } from '@furria/ui';
import type { FC } from 'react';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import { useOfficePublication } from '../hooks/use-office-publication';
import type { BoardOfficeEntry } from '../manage-board-labels';
import { PUBLICATION_EXPLANATION, PUBLICATION_SWITCH_LABEL } from '../manage-board-labels';

interface BoardOfficePublicationPanelProps {
  entry: BoardOfficeEntry;
}

export const BoardOfficePublicationPanel: FC<BoardOfficePublicationPanelProps> = ({ entry }) => {
  const publication = useOfficePublication(entry);

  return (
    <KkPanel variant="block">
      <KkSwitchRow
        label={PUBLICATION_SWITCH_LABEL}
        checked={publication.isPublic}
        onChange={publication.toggle}
        description={PUBLICATION_EXPLANATION}
        stateLabel={SWITCH_STATE_LABELS}
        error={publication.error}
        busy={publication.isSaving}
      />
    </KkPanel>
  );
};
