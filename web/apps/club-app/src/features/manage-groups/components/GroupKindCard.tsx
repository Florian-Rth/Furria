import { KkChip, KkMeta, KkPanel, KkRecordName } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { GroupKindDialog } from '../hooks/use-group-kind-dialogs';
import type { GroupKindEntry } from '../manage-groups-labels';
import {
  isGroupKindArchivable,
  toGroupKindLockedReason,
  toGroupKindUsageBadge,
} from '../manage-groups-labels';
import { GroupKindActions } from './GroupKindActions';

const PANEL = { height: '100%' } as const;
const CARD = { gap: 1.125, minWidth: 0, height: '100%' } as const;
const HEADLINE = {
  gap: 1,
  minWidth: 0,
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
} as const;
const FOOT = { gap: 0.375, minWidth: 0, marginTop: 'auto' } as const;

interface GroupKindCardProps {
  entry: GroupKindEntry;
  onOpen: (dialog: GroupKindDialog, groupKindId: number) => void;
}

export const GroupKindCard: FC<GroupKindCardProps> = ({ entry, onOpen }) => {
  const canArchive = isGroupKindArchivable(entry);
  const usage = toGroupKindUsageBadge(entry);

  const rename = (): void => {
    onOpen('rename', entry.groupKindId);
  };

  const archive = (): void => {
    onOpen('archive', entry.groupKindId);
  };

  const restore = (): void => {
    onOpen('restore', entry.groupKindId);
  };

  const lockedReason =
    entry.isArchived || canArchive ? null : (
      <KkMeta>{toGroupKindLockedReason(entry.groupCount)}</KkMeta>
    );

  return (
    <KkPanel variant="block" dimmed={entry.isArchived} sx={PANEL}>
      <Stack sx={CARD}>
        <Stack direction="row" sx={HEADLINE}>
          <KkRecordName name={entry.name} dimmed={entry.isArchived} />
          <KkChip tone={usage.tone} dot={usage.dot} size="small">
            {usage.label}
          </KkChip>
        </Stack>
        <Stack sx={FOOT}>
          <GroupKindActions
            name={entry.name}
            isArchived={entry.isArchived}
            canArchive={canArchive}
            onRename={rename}
            onArchive={archive}
            onRestore={restore}
          />
          {lockedReason}
        </Stack>
      </Stack>
    </KkPanel>
  );
};
