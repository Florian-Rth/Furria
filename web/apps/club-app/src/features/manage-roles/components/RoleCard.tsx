import { KkHeading, KkMeta, KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { toNoDescriptionLine } from '../manage-roles-labels';
import { RoleStateChips } from './RoleStateChips';

const ROLES_PATH = '/manage/roles';
const FULL_HEIGHT = { height: '100%' } as const;

interface RoleCardProps {
  entry: RoleMasterEntry;
}

export const RoleCard: FC<RoleCardProps> = ({ entry }) => {
  const search = { role: entry.roleId };
  const holderLine = entry.meta === null ? null : <KkMeta>{entry.meta}</KkMeta>;
  const description =
    entry.description === '' ? (
      <KkMeta italic>{toNoDescriptionLine(entry.name)}</KkMeta>
    ) : (
      <KkNote>{entry.description}</KkNote>
    );

  return (
    <KkPanel
      variant="block"
      dimmed={entry.isArchived}
      component={Link}
      to={ROLES_PATH}
      search={search}
      sx={FULL_HEIGHT}
    >
      <Stack sx={{ gap: 1, minWidth: 0 }}>
        <KkHeading level={3}>{entry.name}</KkHeading>
        {holderLine}
        {description}
        <RoleStateChips isArchived={entry.isArchived} isUnheld={entry.isUnheld} />
      </Stack>
    </KkPanel>
  );
};
