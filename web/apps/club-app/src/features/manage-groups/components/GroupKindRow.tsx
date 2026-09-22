import { KkMeta, KkRecordName, KkRegisterRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import type { GroupKindDialog } from '../hooks/use-group-kind-dialogs';
import type { GroupKindEntry } from '../manage-groups-labels';
import {
  isGroupKindArchivable,
  toArchivedGroupKindMeta,
  toGroupKindUsageLine,
} from '../manage-groups-labels';
import { GroupKindActions } from './GroupKindActions';

const NAME_SIZE = { xs: 7, desktop: 4 };
const USAGE_SIZE = { xs: 5, desktop: 3 };
const ACTIONS_SIZE = { xs: 12, desktop: 5 };

const CELL = { minWidth: 0 } as const;
const USAGE_CELL = { minWidth: 0, textAlign: { desktop: 'right' } } as const;
const GRID = { minWidth: 0, alignItems: 'center' } as const;

interface GroupKindRowProps {
  entry: GroupKindEntry;
  onOpen: (dialog: GroupKindDialog, groupKindId: number) => void;
}

export const GroupKindRow: FC<GroupKindRowProps> = ({ entry, onOpen }) => {
  const archivedMeta = toArchivedGroupKindMeta(entry.archivedOn);
  const usage = archivedMeta ?? toGroupKindUsageLine(entry.groupCount);

  const rename = (): void => {
    onOpen('rename', entry.groupKindId);
  };

  const archive = (): void => {
    onOpen('archive', entry.groupKindId);
  };

  const restore = (): void => {
    onOpen('restore', entry.groupKindId);
  };

  return (
    <KkRegisterRow dimmed={entry.isArchived}>
      <Grid container spacing={{ xs: 0.75, desktop: 1.5 }} sx={GRID}>
        <Grid size={NAME_SIZE} sx={CELL}>
          <KkRecordName name={entry.name} size="small" dimmed={entry.isArchived} />
        </Grid>
        <Grid size={USAGE_SIZE} sx={USAGE_CELL}>
          <KkMeta>{usage}</KkMeta>
        </Grid>
        <Grid size={ACTIONS_SIZE} sx={CELL}>
          <GroupKindActions
            name={entry.name}
            groupCount={entry.groupCount}
            isArchived={entry.isArchived}
            canArchive={isGroupKindArchivable(entry)}
            onRename={rename}
            onArchive={archive}
            onRestore={restore}
          />
        </Grid>
      </Grid>
    </KkRegisterRow>
  );
};
