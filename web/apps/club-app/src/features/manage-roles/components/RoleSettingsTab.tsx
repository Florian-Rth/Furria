import { KkFactLine, KkMeta, KkPanelSection, KkText } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { RolePaneControl } from '../hooks/use-role-pane';
import { toNoDescriptionLine } from '../manage-roles-labels';
import { BOARD_TITLE, COIN_LABEL, toCoinLine } from '../roles-hub-copy';
import type { RoleSummary } from '../schemas';
import { RoleOfficeLine } from './RoleOfficeLine';

interface RoleSettingsTabProps {
  role: RoleSummary;
  control: RolePaneControl;
}

export const RoleSettingsTab: FC<RoleSettingsTabProps> = ({ role, control }) => {
  const { description } = control.details;
  const text =
    description === '' ? (
      <KkMeta italic>{toNoDescriptionLine(role.name)}</KkMeta>
    ) : (
      <KkText variant="body2">{description}</KkText>
    );
  const offices = role.impliedBy.map((office) => (
    <RoleOfficeLine key={office.boardOfficeId} office={office} />
  ));
  const board =
    offices.length === 0 ? null : (
      <KkPanelSection title={BOARD_TITLE} meta={offices.length}>
        <Stack sx={{ gap: 0, minWidth: 0 }}>{offices}</Stack>
      </KkPanelSection>
    );

  return (
    <>
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>
        {text}
        <KkFactLine label={COIN_LABEL} value={toCoinLine(role.coin)} />
      </Stack>
      {board}
    </>
  );
};
