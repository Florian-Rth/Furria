import { KkMeta, KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { AppRecordHeaderCard } from '@/features/session';
import type { GroupKindDialog } from '../hooks/use-group-kind-dialogs';
import type { GroupKindEntry } from '../manage-groups-labels';
import {
  ARCHIVED_GROUP_KIND_NOTE,
  GROUP_KIND_EYEBROW,
  isGroupKindArchivable,
  toArchivedGroupKindMeta,
  toGroupKindUsageLine,
} from '../manage-groups-labels';
import { GroupKindActions } from './GroupKindActions';
import { GroupKindChips } from './GroupKindChips';

interface GroupKindSectionProps {
  entry: GroupKindEntry;
  onOpen: (dialog: GroupKindDialog, groupKindId: number) => void;
}

export const GroupKindSection: FC<GroupKindSectionProps> = ({ entry, onOpen }) => {
  const rename = (): void => {
    onOpen('rename', entry.groupKindId);
  };

  const archive = (): void => {
    onOpen('archive', entry.groupKindId);
  };

  const restore = (): void => {
    onOpen('restore', entry.groupKindId);
  };

  const archivedMeta = toArchivedGroupKindMeta(entry.archivedOn);
  const hasChips = entry.isArchived || entry.groupCount === 0;
  const chips = hasChips ? (
    <GroupKindChips isArchived={entry.isArchived} isUnused={entry.groupCount === 0} />
  ) : undefined;

  const note =
    archivedMeta === undefined ? undefined : (
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>
        <KkMeta>{archivedMeta}</KkMeta>
        <KkNote>{ARCHIVED_GROUP_KIND_NOTE}</KkNote>
      </Stack>
    );

  return (
    <AppRecordHeaderCard
      eyebrow={GROUP_KIND_EYEBROW}
      title={entry.name}
      chips={chips}
      description={<KkMeta>{toGroupKindUsageLine(entry.groupCount)}</KkMeta>}
      note={note}
      actions={
        <GroupKindActions
          isArchived={entry.isArchived}
          canArchive={isGroupKindArchivable(entry)}
          onRename={rename}
          onArchive={archive}
          onRestore={restore}
        />
      }
      dimmed={entry.isArchived}
    />
  );
};
