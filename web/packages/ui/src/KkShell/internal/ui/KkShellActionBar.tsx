import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode, Ref } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { KkConsequenceNote } from '../../../KkConsequenceNote';
import type { KkScreenActionBar, KkScreenActionContext } from '../../screen-declaration';
import { actionBarHeightOf } from '../logic/action-bar-height';
import { actionContextOf } from '../logic/action-context';
import { KkShellActionDeed } from './KkShellActionDeed';

const ACTION_DENSITY = 1;
const ACTION_PADDING_X = 1;
const CONTEXT_GAP = 0.5;
const DEED_GAP = 1;

const contextNodeOf = (context: KkScreenActionContext): ReactNode => {
  if (context.tone === 'consequence') {
    return <KkConsequenceNote>{context.text}</KkConsequenceNote>;
  }

  return (
    <Typography variant="body2" noWrap sx={{ color: 'text.secondary', textAlign: 'center' }}>
      {context.text}
    </Typography>
  );
};

interface KkShellActionBarProps {
  action: KkScreenActionBar;
  ref?: Ref<HTMLDivElement>;
}

export const KkShellActionBar: FC<KkShellActionBarProps> = ({ action, ref }) => {
  const resolvedContext = actionContextOf(action.context);
  const context = resolvedContext === null ? null : contextNodeOf(resolvedContext);

  const secondary =
    action.secondary === undefined ? null : (
      <KkShellActionDeed deed={action.secondary} weight="outlined" sx={{ flexShrink: 0 }} />
    );

  return (
    <KkChrome
      ref={ref}
      density={ACTION_DENSITY}
      sx={{
        minHeight: `${actionBarHeightOf(action)}px`,
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
