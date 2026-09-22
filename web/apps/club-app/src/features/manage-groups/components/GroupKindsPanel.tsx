import { KkButton, KkIcon, KkPanel, KkPanelSection } from '@furria/ui';
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
import { GroupKindFormDialog } from './GroupKindFormDialog';
import { GroupKindRow } from './GroupKindRow';
import { GroupKindsEmpty } from './GroupKindsEmpty';
import { RestoreGroupKindDialog } from './RestoreGroupKindDialog';

interface GroupKindsPanelProps {
  kinds: readonly ManagedGroupKind[];
}

export const GroupKindsPanel: FC<GroupKindsPanelProps> = ({ kinds }) => {
  const entries = toGroupKindEntries(kinds);
  const dialogs = useGroupKindDialogs(entries);

  const rows = entries.map((entry) => (
    <GroupKindRow key={entry.groupKindId} entry={entry} onOpen={dialogs.openFor} />
  ));

  const body =
    entries.length === 0 ? (
      <KkPanel variant="block">
        <GroupKindsEmpty onCreate={dialogs.openCreate} />
      </KkPanel>
    ) : (
      <KkPanel variant="list">{rows}</KkPanel>
    );

  const isCreating = dialogs.openDialog === 'create';
  const renamed = dialogs.openDialog === 'rename' ? dialogs.kind : null;

  const action = (
    <KkButton
      size="small"
      variant="outlined"
      startIcon={<KkIcon name="add" size="small" />}
      onClick={dialogs.openCreate}
    >
      {CREATE_GROUP_KIND_LABEL}
    </KkButton>
  );

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
