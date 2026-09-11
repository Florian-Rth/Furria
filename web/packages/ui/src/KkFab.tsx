import Fab from '@mui/material/Fab';
import type { ElementType, FC } from 'react';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const FAB_SIZE = 54;
const FAB_INSET_RIGHT = 20;
const FAB_INSET_BOTTOM = 84;
const FAB_LAYER = 9;

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
        {
          display: { xs: 'inline-flex', desktop: 'none' },
          position: 'fixed',
          right: FAB_INSET_RIGHT,
          bottom: FAB_INSET_BOTTOM,
          zIndex: FAB_LAYER,
          width: FAB_SIZE,
          height: FAB_SIZE,
          boxShadow: kkTokens.shadow.floating,
          color: 'primary.contrastText',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkIcon name={icon} />
    </Fab>
  );
};
