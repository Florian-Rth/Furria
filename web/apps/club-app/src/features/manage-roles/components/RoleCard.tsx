import { KkEyebrow, KkHeading, KkMeta, KkPanel, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { RoleMasterEntry } from '../manage-roles-labels';
import { toHolderUnitLabel, toNoDescriptionLine } from '../manage-roles-labels';
import { RoleStateChips } from './RoleStateChips';

const ROLES_PATH = '/manage/roles';
const DESCRIPTION_LINES = 3;
const FULL_HEIGHT = { height: '100%' } as const;

interface RoleCardProps {
  entry: RoleMasterEntry;
}

export const RoleCard: FC<RoleCardProps> = ({ entry }) => {
  const search = { role: entry.roleId };
  const unitLabel = toHolderUnitLabel(entry.holderCount);
  const holderLine = entry.meta === null ? null : <KkMeta>{entry.meta}</KkMeta>;

  const description =
    entry.description === '' ? (
      <KkMeta italic>{toNoDescriptionLine(entry.name)}</KkMeta>
    ) : (
      <KkText variant="body2" clamp={DESCRIPTION_LINES}>
        {entry.description}
      </KkText>
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
      <Stack sx={{ gap: 1.25, minWidth: 0, height: '100%' }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5, minWidth: 0 }}>
          <Stack sx={{ gap: 0.875, minWidth: 0, flexGrow: 1, alignItems: 'flex-start' }}>
            <KkHeading level={5} component="h3" sx={{ minWidth: 0 }}>
              {entry.name}
            </KkHeading>
            <RoleStateChips isArchived={entry.isArchived} isUnheld={entry.isUnheld} />
          </Stack>
          <Stack sx={{ alignItems: 'flex-end', gap: 0.25, flexShrink: 0 }}>
            <KkHeading level={4} tone="accent" component="p">
              {entry.holderCount}
            </KkHeading>
            <KkEyebrow tone="muted" size="small">
              {unitLabel}
            </KkEyebrow>
          </Stack>
        </Stack>
        {holderLine}
        {description}
      </Stack>
    </KkPanel>
  );
};
