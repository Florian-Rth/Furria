import Fab from '@mui/material/Fab';
import type { ElementType, FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const FAB_SIZE = 54;
const FAB_INSET_RIGHT = 20;

interface KkFabProps {
  label: string;
  icon?: KkIconName;
  onClick?: () => void;
  component?: ElementType;
  to?: string;
  sx?: KkSx;
}

export const KkFab: FC<KkFabProps> = ({ label, icon = 'add', onClick, component, to, sx }) => {
  const linkProps = component === undefined ? {} : { component, to };

  return (
    <Fab
      color="primary"
      aria-label={label}
      onClick={onClick}
      {...linkProps}
      data-kk-fab
      sx={[
        (theme) => ({
          display: { xs: 'inline-flex', desktop: 'none' },
          position: 'fixed',
          right: FAB_INSET_RIGHT,
          bottom: kkTokens.layout.curtainClearance,
          zIndex: theme.zIndex.fab,
          width: FAB_SIZE,
          height: FAB_SIZE,
          boxShadow: kkTokens.shadow.floating,
          color: 'primary.contrastText',
          ...focusRing(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkIcon name={icon} />
    </Fab>
  );
};
