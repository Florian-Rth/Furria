import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';

const CLOSE_SIZE = 34;
const CLOSE_LABEL = 'Menü schließen';

export const KkAppShellCurtainClose: FC = () => {
  const curtain = useAppShellCurtain();

  return (
    <Stack
      component="button"
      type="button"
      aria-label={CLOSE_LABEL}
      onClick={curtain.close}
      data-kk-app-shell-curtain-close
      sx={{
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
      }}
    >
      <KkIcon name="close" size="small" />
    </Stack>
  );
};
