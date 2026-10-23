import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { usePlannerAction } from '../hooks/use-planner-action';
import { usePlanner } from '../planner-context';
import { PlannerDeedButton } from './PlannerDeedButton';
import { PlannerStatus } from './PlannerStatus';

export const PlannerModeTool: FC = () => {
  const planner = usePlanner();
  const { tools } = usePlannerAction(planner);
  const items = tools.map((tool) => {
    const weight = tool.active ? 'contained' : 'outlined';

    return <PlannerDeedButton key={tool.id} deed={tool.deed} weight={weight} />;
  });
  const buttons =
    items.length === 0 ? null : (
      <Stack direction="row" sx={{ ml: 'auto', gap: 1, alignItems: 'center' }}>
        {items}
      </Stack>
    );

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        minWidth: 0,
        '&:empty': { display: 'none' },
      }}
    >
      <PlannerStatus />
      {buttons}
    </Stack>
  );
};
