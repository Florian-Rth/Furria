import { KkRecordName, KkRegisterRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toGroupTone } from '@/features/groups';
import { toGroupFactsLine, toGroupRegisterFlags } from '../manage-groups-labels';
import type { ManagedGroupSummary } from '../schemas';
import { GroupRegisterActions } from './GroupRegisterActions';
import { GroupRegisterFacts } from './GroupRegisterFacts';
import { GroupRegisterFlags } from './GroupRegisterFlags';

const HUB_PATH = '/groups/$groupId';

const ROW = {
  gap: { xs: 1, desktop: 2.5 },
  minWidth: 0,
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const;

const IDENTITY = { gap: 0.625, minWidth: 0, flexGrow: 1, flexBasis: '17rem' } as const;
const HEADLINE = { gap: 1, minWidth: 0, alignItems: 'center', flexWrap: 'wrap' } as const;
const ACTIONS = { minWidth: 0, flexBasis: { xs: '100%', desktop: 'auto' } } as const;

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
  const isArchived = group.archivedOn !== null;
  const tone = isArchived ? undefined : toGroupTone(group.groupId, group.tone);

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

  const name = isArchived ? (
    <KkRecordName name={group.name} dimmed />
  ) : (
    <KkRecordName
      name={group.name}
      component={Link}
      to={HUB_PATH}
      params={{ groupId: String(group.groupId) }}
    />
  );

  return (
    <KkRegisterRow groupTone={tone}>
      <Stack direction="row" sx={ROW}>
        <Stack sx={IDENTITY}>
          <Stack direction="row" sx={HEADLINE}>
            {name}
            <GroupRegisterFlags flags={toGroupRegisterFlags(group)} />
          </Stack>
          <GroupRegisterFacts admins={group.admins} line={toGroupFactsLine(group)} />
        </Stack>
        <Stack sx={ACTIONS}>
          <GroupRegisterActions
            groupName={group.name}
            isArchived={isArchived}
            needsAdmin={group.admins.length === 0}
            onAppointAdmin={appoint}
            onEdit={edit}
            onArchive={archive}
            onRestore={restore}
          />
        </Stack>
      </Stack>
    </KkRegisterRow>
  );
};
