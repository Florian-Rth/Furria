import { KkButton, KkFactLine, KkIcon, KkNote, KkSwitchRow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { SWITCH_STATE_LABELS } from '@/lib/state-chips';
import {
  ARCHIVED_NOTE,
  EDIT_OFFICE_LABEL,
  EDIT_OFFICE_PATH,
  NO_ROLE,
  ORDER_LABEL,
  ROLE_LABEL,
  WEBSITE_LINE,
  WEBSITE_SWITCH,
} from '../board-hub-copy';
import type { OfficePaneControl } from '../hooks/use-office-pane';
import type { BoardOffice } from '../schemas';

const OFFICE_RETURN = { from: 'office' } as const;

interface OfficeSettingsTabProps {
  office: BoardOffice;
  control: OfficePaneControl;
  onPage: boolean;
}

export const OfficeSettingsTab: FC<OfficeSettingsTabProps> = ({ office, control, onPage }) => {
  if (control.isArchived) {
    return <KkNote>{ARCHIVED_NOTE}</KkNote>;
  }

  const params = { boardOfficeId: String(office.boardOfficeId) };
  const search = onPage ? OFFICE_RETURN : undefined;
  const role = office.impliedRoleName ?? NO_ROLE;
  const order = String(office.sortOrder);
  const { publication } = control;

  return (
    <Stack sx={{ gap: 0, minWidth: 0 }}>
      <KkSwitchRow
        label={WEBSITE_SWITCH}
        description={WEBSITE_LINE}
        checked={office.isPublic}
        onChange={publication.toggle}
        stateLabel={SWITCH_STATE_LABELS}
        error={publication.error}
        busy={publication.isSaving}
      />
      <KkFactLine label={ROLE_LABEL} value={role} />
      <KkFactLine label={ORDER_LABEL} value={order} />
      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <KkButton
          size="small"
          variant="text"
          startIcon={<KkIcon name="edit" size="small" />}
          component={Link}
          to={EDIT_OFFICE_PATH}
          params={params}
          search={search}
        >
          {EDIT_OFFICE_LABEL}
        </KkButton>
      </Stack>
    </Stack>
  );
};
