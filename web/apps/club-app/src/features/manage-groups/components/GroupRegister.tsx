import type { KkPanelAction } from '@furria/ui';
import { KkEmptyState, KkEyebrow, KkPanel, KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MANAGED_GROUPS_EMPTY, REGISTER_TITLE } from '../manage-groups-labels';
import type { GroupRegisterBands, GroupWorkFilterId } from '../manage-groups-work';
import { countBandedGroups, toRegisterMeta } from '../manage-groups-work';
import { GroupRegisterBand } from './GroupRegisterBand';

const ARCHIVED_BAND_TITLE = 'Archiviert';
const CREATE_GROUP_PILL_LABEL = 'Gruppe';
const CREATE_GROUP_ACTION_LABEL = 'Gruppe hinzufügen';
const NEW_GROUP_ROUTE = '/manage/groups/new';

const BAND_LABEL = { pt: 2.25, pb: 0.5, minWidth: 0 } as const;

interface GroupRegisterProps {
  bands: GroupRegisterBands;
  filter: GroupWorkFilterId;
  isFiltered: boolean;
  highlightedKey: string | null;
}

export const GroupRegister: FC<GroupRegisterProps> = ({
  bands,
  filter,
  isFiltered,
  highlightedKey,
}) => {
  const shown = countBandedGroups(bands);
  const empty = isFiltered ? MANAGED_GROUPS_EMPTY.filtered : MANAGED_GROUPS_EMPTY.cold;

  const archivedLabel =
    bands.archived.length === 0 ? null : (
      <Stack sx={BAND_LABEL}>
        <KkEyebrow tone="muted">{ARCHIVED_BAND_TITLE}</KkEyebrow>
      </Stack>
    );

  const body =
    shown === 0 ? (
      <KkPanel variant="block">
        <KkEmptyState title={empty.title} description={empty.description} />
      </KkPanel>
    ) : (
      <KkPanel variant="list">
        <GroupRegisterBand groups={bands.running} highlightedKey={highlightedKey} />
        {archivedLabel}
        <GroupRegisterBand groups={bands.archived} highlightedKey={highlightedKey} />
      </KkPanel>
    );

  const action: KkPanelAction = {
    label: CREATE_GROUP_PILL_LABEL,
    icon: 'add',
    ariaLabel: CREATE_GROUP_ACTION_LABEL,
    component: Link,
    to: NEW_GROUP_ROUTE,
  };

  return (
    <KkPanelSection title={REGISTER_TITLE} meta={toRegisterMeta(filter, bands)} action={action}>
      {body}
    </KkPanelSection>
  );
};
