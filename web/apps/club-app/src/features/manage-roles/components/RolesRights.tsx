import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RightGroup } from '../roles-hub';
import { toRightGroupTitle } from '../roles-hub-copy';
import type { RolePaneTab } from '../schemas';
import { RightLine } from './RightLine';

interface RolesRightsProps {
  groups: readonly RightGroup[];
  selectedId: number | null;
  onOpen: (roleId: number, tab?: RolePaneTab) => void;
}

export const RolesRights: FC<RolesRightsProps> = ({ groups, selectedId, onOpen }) => {
  const sections = groups.map((group) => {
    const lines = group.entries.map((entry) => (
      <RightLine key={entry.key} entry={entry} selectedId={selectedId} onOpen={onOpen} />
    ));

    return (
      <KkPanelSection key={group.id} title={toRightGroupTitle(group.id)}>
        <Stack sx={{ gap: 0, minWidth: 0 }}>{lines}</Stack>
      </KkPanelSection>
    );
  });

  return <Stack sx={{ gap: 2.5, minWidth: 0 }}>{sections}</Stack>;
};
