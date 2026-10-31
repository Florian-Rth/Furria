import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkButton } from '../../../KkButton';
import type { KkNoticeActions as KkNoticeActionList } from '../../notice-declaration';

const ACTION_GAP = 1;

interface KkNoticeActionsProps {
  actions: KkNoticeActionList;
  onAnswered: () => void;
}

export const KkNoticeActions: FC<KkNoticeActionsProps> = ({ actions, onAnswered }) => {
  const buttons = actions.map((action) => {
    const answer = (): void => {
      action.onSelect();
      onAnswered();
    };

    return (
      <KkButton key={action.id} variant="outlined" size="small" onClick={answer}>
        {action.label}
      </KkButton>
    );
  });

  return (
    <Stack
      direction="row"
      data-kk-notice-actions
      sx={{ minWidth: 0, flexWrap: 'wrap', alignItems: 'center', gap: ACTION_GAP }}
    >
      {buttons}
    </Stack>
  );
};
