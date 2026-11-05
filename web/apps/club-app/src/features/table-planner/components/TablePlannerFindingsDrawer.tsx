import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useFindingsList } from '../hooks/use-findings-list';
import { FINDINGS_CLOSE, FINDINGS_TITLE, NO_FINDINGS_NOTE } from '../table-planner-copy';
import { TablePlannerFindingRow } from './TablePlannerFindingRow';

export const TablePlannerFindingsDrawer: FC = () => {
  const list = useFindingsList();
  const rows = list.items.map((item) => <TablePlannerFindingRow key={item.key} item={item} />);
  const body = list.items.length === 0 ? <KkNote>{NO_FINDINGS_NOTE}</KkNote> : rows;

  return (
    <KkBottomDrawer
      open={list.open}
      label={FINDINGS_TITLE}
      closeLabel={FINDINGS_CLOSE}
      onClose={list.close}
    >
      <Box sx={{ px: 2, pb: 2, overflowY: 'auto' }}>
        <KkPanelSection title={FINDINGS_TITLE}>
          <Stack sx={{ rowGap: 2 }}>{body}</Stack>
        </KkPanelSection>
      </Box>
    </KkBottomDrawer>
  );
};
