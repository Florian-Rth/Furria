import { KkChip, KkMeta, KkRecordName, KkRegisterRow } from '@furria/ui';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toGroupKindLabel, toGroupTone } from '@/features/groups';
import { toGroupSizeLine } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { GroupRegisterActions } from './GroupRegisterActions';
import { GroupRegisterAdmins } from './GroupRegisterAdmins';

const IDENTITY_SIZE = { xs: 12, desktop: 4 };
const ADMINS_SIZE = { xs: 7, desktop: 3 };
const COUNT_SIZE = { xs: 5, desktop: 2 };
const ACTIONS_SIZE = { xs: 12, desktop: 3 };

const CELL = { minWidth: 0 } as const;
const COUNT_CELL = { minWidth: 0, textAlign: { desktop: 'right' } } as const;
const CHIP_ROW = { alignItems: 'center', gap: 0.75, flexWrap: 'wrap', minWidth: 0 } as const;
const IDENTITY = { gap: 0.5, minWidth: 0 } as const;
const GRID = { minWidth: 0, alignItems: 'center' } as const;

interface GroupRegisterRowProps {
  group: ManagedGroupSummary;
  onAppointAdmin: (groupId: number) => void;
  onEdit: (groupId: number) => void;
  onArchive: (groupId: number) => void;
  onRestore: (groupId: number) => void;
}

export const GroupRegisterRow: FC<GroupRegisterRowProps> = ({
  group,
  onAppointAdmin,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const tone = toGroupTone(group.groupId, group.tone);
  const isArchived = group.archivedOn !== null;
  const kindLabel = toGroupKindLabel(group.groupKindName);

  const appoint = (): void => {
    onAppointAdmin(group.groupId);
  };

  const edit = (): void => {
    onEdit(group.groupId);
  };

  const archive = (): void => {
    onArchive(group.groupId);
  };

  const restore = (): void => {
    onRestore(group.groupId);
  };

  const kindSlot =
    kindLabel === null ? null : (
      <KkChip tone="neutral" size="small">
        {kindLabel}
      </KkChip>
    );

  const chips =
    kindSlot === null ? null : (
      <Stack direction="row" sx={CHIP_ROW}>
        {kindSlot}
      </Stack>
    );

  return (
    <KkRegisterRow groupTone={tone} dimmed={isArchived}>
      <Grid container spacing={{ xs: 1, desktop: 1.5 }} sx={GRID}>
        <Grid size={IDENTITY_SIZE} sx={CELL}>
          <Stack sx={IDENTITY}>
            <KkRecordName name={group.name} dimmed={isArchived} />
            {chips}
          </Stack>
        </Grid>
        <Grid size={ADMINS_SIZE} sx={CELL}>
          <GroupRegisterAdmins
            admins={group.admins}
            groupName={group.name}
            canAppoint={!isArchived}
            onAppoint={appoint}
          />
        </Grid>
        <Grid size={COUNT_SIZE} sx={COUNT_CELL}>
          <KkMeta>{toGroupSizeLine(group.memberCount)}</KkMeta>
        </Grid>
        <Grid size={ACTIONS_SIZE} sx={CELL}>
          <GroupRegisterActions
            groupId={group.groupId}
            groupName={group.name}
            isArchived={isArchived}
            onEdit={edit}
            onArchive={archive}
            onRestore={restore}
          />
        </Grid>
      </Grid>
    </KkRegisterRow>
  );
};
