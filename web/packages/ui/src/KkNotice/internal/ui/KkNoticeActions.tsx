import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import type { KkNoticeActions as KkNoticeActionList } from '../../notice-declaration';

const ACTION_GAP = 1;

interface KkNoticeActionsProps {
  actions: KkNoticeActionList;
}

export const KkNoticeActions: FC<KkNoticeActionsProps> = ({ actions }) => (
  <Stack
    direction="row"
    data-kk-notice-actions
    sx={{ minWidth: 0, flexWrap: 'wrap', alignItems: 'center', gap: ACTION_GAP }}
  >
    {actions.map((action) => (
      <KkButton key={action.id} variant="outlined" size="small" onClick={action.onSelect}>
        {action.label}
      </KkButton>
    ))}
  </Stack>
);
