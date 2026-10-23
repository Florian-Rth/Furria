import { KkButton } from '@furria/ui/KkButton';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePlanner } from '../planner-context';
import { MANAGE_ACTS_LABEL, NEW_ACT_LABEL } from '../planner-copy';

const ACTS_PATH = '/acts';

export const PlannerActsLinks: FC = () => {
  const planner = usePlanner();
  const newActSearch = { act: 'new', from: planner.eventId } as const;

  return (
    <Stack direction="row" sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
      <KkButton size="small" variant="text" component={Link} to={ACTS_PATH}>
        {MANAGE_ACTS_LABEL}
      </KkButton>
      <KkButton
        size="small"
        variant="text"
        startIcon={<KkIcon name="add" size="small" />}
        component={Link}
        to={ACTS_PATH}
        search={newActSearch}
      >
        {NEW_ACT_LABEL}
      </KkButton>
    </Stack>
  );
};
