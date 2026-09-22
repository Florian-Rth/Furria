import type { KkPanelAction } from '@furria/ui';
import { KkPanel, KkPanelSection } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { useGroupKindDialogs } from '../hooks/use-group-kind-dialogs';
import {
  CREATE_GROUP_KIND_LABEL,
  GROUP_KINDS_PANEL_TITLE,
  toGroupKindEntries,
  toGroupKindsIntro,
} from '../manage-groups-labels';
import type { ManagedGroupKind } from '../schemas';
import { ArchiveGroupKindDialog } from './ArchiveGroupKindDialog';
import { GroupKindCard } from './GroupKindCard';
import { GroupKindFormDialog } from './GroupKindFormDialog';
import { GroupKindsEmpty } from './GroupKindsEmpty';
import { RestoreGroupKindDialog } from './RestoreGroupKindDialog';

const GRID_SPACING = { xs: 1.5, desktop: 2 };
const CARD_SIZE = { xs: 12, sm: 6, desktop: 4 };
const CARD_SLOT = { minWidth: 0 } as const;
const GRID = { minWidth: 0 } as const;

interface GroupKindsPanelProps {
  kinds: readonly ManagedGroupKind[];
}

export const GroupKindsPanel: FC<GroupKindsPanelProps> = ({ kinds }) => {
  const entries = toGroupKindEntries(kinds);
  const dialogs = useGroupKindDialogs(entries);

  const cards = entries.map((entry) => (
    <Grid key={entry.groupKindId} size={CARD_SIZE} sx={CARD_SLOT}>
      <GroupKindCard entry={entry} onOpen={dialogs.openFor} />
    </Grid>
  ));

  const body =
    entries.length === 0 ? (
      <KkPanel variant="block">
        <GroupKindsEmpty onCreate={dialogs.openCreate} />
      </KkPanel>
    ) : (
      <Grid container spacing={GRID_SPACING} sx={GRID}>
        {cards}
      </Grid>
    );

  const isCreating = dialogs.openDialog === 'create';
  const renamed = dialogs.openDialog === 'rename' ? dialogs.kind : null;

  const action: KkPanelAction = {
    label: CREATE_GROUP_KIND_LABEL,
    icon: 'add',
    onClick: dialogs.openCreate,
  };

  return (
    <KkPanelSection
      title={GROUP_KINDS_PANEL_TITLE}
      meta={toGroupKindsIntro(entries)}
      action={action}
    >
      {body}
      <GroupKindFormDialog
        open={isCreating || renamed !== null}
        editedKind={renamed}
        onClose={dialogs.close}
        onSaved={dialogs.close}
      />
      <ArchiveGroupKindDialog
        kind={dialogs.openDialog === 'archive' ? dialogs.kind : null}
        onClose={dialogs.close}
      />
      <RestoreGroupKindDialog
        kind={dialogs.openDialog === 'restore' ? dialogs.kind : null}
        onClose={dialogs.close}
      />
    </KkPanelSection>
  );
};
