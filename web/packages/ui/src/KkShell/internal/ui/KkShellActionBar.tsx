import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode, Ref } from 'react';
import { safeArea } from '../../../internal/safe-area';
import type { KkScheme } from '../../../internal/scheme-paint';
import { applyScheme } from '../../../internal/scheme-paint';
import { KkConsequenceNote } from '../../../KkConsequenceNote';
import { kkTokens } from '../../../tokens';
import type { KkScreenActionBar, KkScreenActionContext } from '../../screen-declaration';
import { actionBarHeightOf } from '../logic/action-bar-height';
import { actionContextOf } from '../logic/action-context';
import { KkShellActionDeed } from './KkShellActionDeed';

const { gutter, actionFadeHeight } = kkTokens.shell;
const CONTEXT_GAP = 0.5;
const DEED_GAP = 1;
const FADE_SOLID_STOP = '45%';

const fadeGradient = (bg: string): string =>
  `linear-gradient(to bottom, ${alpha(bg, 0)} 0%, ${bg} ${FADE_SOLID_STOP})`;

const fadeScheme: KkScheme = {
  light: { backgroundImage: fadeGradient(kkTokens.color.light.bg) },
  dark: { backgroundImage: fadeGradient(kkTokens.color.dark.bg) },
};

const actionBarPaint = (theme: Theme, minHeight: number): CSSObject => ({
  position: 'relative',
  isolation: 'isolate',
  minWidth: 0,
  minHeight: `${minHeight}px`,
  gap: theme.spacing(CONTEXT_GAP),
  justifyContent: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    zIndex: -1,
    top: -actionFadeHeight,
    left: `calc(-1 * ${safeArea('left', gutter)})`,
    right: `calc(-1 * ${safeArea('right', gutter)})`,
    bottom: `calc(-1 * ${safeArea('bottom', gutter)})`,
    pointerEvents: 'none',
    ...applyScheme(theme, fadeScheme),
  },
});

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
  const minHeight = actionBarHeightOf(action);

  const secondary =
    action.secondary === undefined ? null : (
      <KkShellActionDeed deed={action.secondary} weight="outlined" sx={{ flexShrink: 0 }} />
    );

  return (
    <Stack ref={ref} data-kk-shell-action sx={(theme) => actionBarPaint(theme, minHeight)}>
      {context}
      <Stack direction="row" sx={{ minWidth: 0, alignItems: 'center', gap: DEED_GAP }}>
        {secondary}
        <KkShellActionDeed deed={action.primary} weight="contained" sx={{ flexGrow: 1 }} />
      </Stack>
    </Stack>
  );
};
