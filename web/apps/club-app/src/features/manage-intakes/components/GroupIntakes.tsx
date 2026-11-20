import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useIntakesQuery } from '../api';
import { toGroupIntakeRows } from '../intake-labels';
import { IntakeStartLink } from './IntakeStartLink';

const START_SX = { alignSelf: 'flex-start' } as const;
const BLOCK_SX = { gap: 1.5, minWidth: 0 } as const;

interface GroupIntakesProps {
  groupId: number;
}

export const GroupIntakes: FC<GroupIntakesProps> = ({ groupId }) => {
  const intakes = useIntakesQuery();
  const rowModels = toGroupIntakeRows(intakes.data?.intakes ?? [], groupId, new Date());
  const rows = rowModels.map((row) => (
    <KkHubRow
      key={row.intakeId}
      label={row.name}
      icon="qr"
      meta={row.meta}
      hint={row.chip.label}
      hintTone={row.chip.tone}
      component={Link}
      to={row.path}
    />
  ));
  const list = rows.length === 0 ? null : <KkPanel>{rows}</KkPanel>;

  return (
    <Stack sx={BLOCK_SX}>
      {list}
      <IntakeStartLink groupId={groupId} sx={START_SX} />
    </Stack>
  );
};
