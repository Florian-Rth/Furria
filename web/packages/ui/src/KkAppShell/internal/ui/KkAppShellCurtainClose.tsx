import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';

const CLOSE_SIZE = 34;
const CLOSE_LABEL = 'Menü schließen';
const MUI_FOCUS_TARGET_ATTRIBUTE = 'data-mui-focusable';

const initialFocusTarget = { [MUI_FOCUS_TARGET_ATTRIBUTE]: '' };

export const KkAppShellCurtainClose: FC = () => {
  const curtain = useAppShellCurtain();

  return (
    <Stack
      component="button"
      type="button"
      {...initialFocusTarget}
      aria-label={CLOSE_LABEL}
      onClick={curtain.close}
      data-kk-app-shell-curtain-close
      sx={(theme) => ({
        width: CLOSE_SIZE,
        height: CLOSE_SIZE,
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        p: 0,
        borderRadius: `${kkTokens.radius.pill}px`,
        border: 1.5,
        borderStyle: 'solid',
        borderColor: 'divider',
        background: 'none',
        color: 'text.primary',
        cursor: 'pointer',
        ...focusRing(theme),
      })}
    >
      <KkIcon name="close" size="small" />
    </Stack>
  );
};
