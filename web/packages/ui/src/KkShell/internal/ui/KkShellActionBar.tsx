import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import type { KkScreenActionBar } from '../../screen-declaration';
import { actionBarHeightOf } from '../logic/action-bar-height';
import { KkShellActionDeed } from './KkShellActionDeed';

const ACTION_DENSITY = 1;
const ACTION_PADDING_X = 1;
const CONTEXT_GAP = 0.5;
const DEED_GAP = 1;

interface KkShellActionBarProps {
  action: KkScreenActionBar;
}

export const KkShellActionBar: FC<KkShellActionBarProps> = ({ action }) => {
  const context =
    action.context === undefined ? null : (
      <Typography variant="body2" noWrap sx={{ color: 'text.secondary', textAlign: 'center' }}>
        {action.context}
      </Typography>
    );

  const secondary =
    action.secondary === undefined ? null : (
      <KkShellActionDeed deed={action.secondary} weight="outlined" sx={{ flexShrink: 0 }} />
    );

  return (
    <KkChrome
      density={ACTION_DENSITY}
      sx={{
        height: `${actionBarHeightOf(action)}px`,
        px: ACTION_PADDING_X,
        gap: CONTEXT_GAP,
        justifyContent: 'center',
      }}
    >
      {context}
      <Stack direction="row" sx={{ minWidth: 0, alignItems: 'center', gap: DEED_GAP }}>
        {secondary}
        <KkShellActionDeed deed={action.primary} weight="contained" sx={{ flexGrow: 1 }} />
      </Stack>
    </KkChrome>
  );
};
