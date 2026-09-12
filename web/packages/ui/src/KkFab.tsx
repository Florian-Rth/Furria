import Fab from '@mui/material/Fab';
import type { ElementType, FC } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const FAB_HEIGHT = 54;
const FAB_INSET_RIGHT = 20;
const FAB_FONT_SIZE = '0.8125rem';
const FAB_MAX_WIDTH = 'calc(100vw - 40px)';

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
      variant="extended"
      color="primary"
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
          height: FAB_HEIGHT,
          maxWidth: FAB_MAX_WIDTH,
          gap: 1,
          pl: 2.25,
          pr: 2.75,
          fontFamily: kkTokens.font.display,
          fontSize: FAB_FONT_SIZE,
          fontWeight: kkTokens.font.displayWeight,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          boxShadow: kkTokens.shadow.floating,
          color: 'primary.contrastText',
          ...focusRing(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkIcon name={icon} size="small" />
      {label}
    </Fab>
  );
};
