import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWash } from './internal/ink-wash';
import { raisedSurfaceScheme } from './internal/raised-surface';
import { redInk } from './internal/red-ink';
import type { KkScheme } from './internal/scheme-paint';
import { applyScheme, schemeEdge } from './internal/scheme-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

type KkPanelVariant = 'list' | 'block';
type KkPanelTone = 'cream' | 'raised' | 'reserved' | 'editing';

const RESERVED_EDGE_LIGHT = '28%';
const RESERVED_EDGE_DARK = '32%';

const panelPadding: Record<KkPanelVariant, { px: number; py: number }> = {
  list: { px: 2, py: 0.5 },
  block: { px: 2, py: 1.75 },
};

const reservedEdge = (theme: Theme): KkScheme =>
  schemeEdge(inkWash(theme, RESERVED_EDGE_LIGHT), inkWash(theme, RESERVED_EDGE_DARK));

const liftScheme: KkScheme = {
  light: { boxShadow: kkTokens.shadow.rest },
  dark: { boxShadow: kkTokens.chrome.dark.lift },
};

const toneStyles: Record<KkPanelTone, (theme: Theme) => CSSObject> = {
  cream: () => ({ backgroundColor: 'background.paper', borderStyle: 'solid' }),
  raised: (theme) => ({ ...applyScheme(theme, raisedSurfaceScheme), borderStyle: 'solid' }),
  reserved: (theme) => ({
    ...applyScheme(theme, raisedSurfaceScheme, reservedEdge(theme)),
    borderStyle: 'dashed',
  }),
  editing: (theme) => ({
    ...applyScheme(theme, raisedSurfaceScheme, liftScheme),
    borderStyle: 'solid',
    borderColor: 'primary.main',
  }),
};

const interactivePaint = (theme: Theme): CSSObject => ({
  width: '100%',
  appearance: 'none',
  textAlign: 'left',
  textDecoration: 'none',
  color: 'inherit',
  cursor: 'pointer',
  borderColor: 'divider',
  ...applyScheme(theme, liftScheme),
  ...focusRing(theme),
  '@media (hover: hover)': {
    '&:hover': {
      borderColor: 'primary.main',
      '& [data-kk-heading]': redInk(theme),
    },
  },
});

const dimmedPaint: CSSObject = {
  '& [data-kk-heading]': { color: 'text.secondary' },
  '& [data-kk-avatar-stack]': { opacity: kkTokens.opacity.dimmed },
};

interface KkPanelProps extends PropsWithChildren {
  variant?: KkPanelVariant;
  tone?: KkPanelTone;
  dimmed?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  sx?: KkSx;
}

export const KkPanel: FC<KkPanelProps> = ({
  variant = 'list',
  tone = 'cream',
  dimmed = false,
  component,
  to,
  params,
  onClick,
  sx,
  children,
}) => {
  const interactive = component !== undefined || onClick !== undefined;
  const panelComponent = component ?? (onClick === undefined ? 'div' : 'button');
  const routeProps = component === undefined ? {} : { to, params };
  const nativeProps = panelComponent === 'button' ? { type: 'button' as const } : {};

  return (
    <Stack
      component={panelComponent}
      {...routeProps}
      {...nativeProps}
      onClick={onClick}
      data-kk-panel
      sx={[
        (theme) => ({
          minWidth: 0,
          borderWidth: kkTokens.line.hair,
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
          ...toneStyles[tone](theme),
          ...panelPadding[variant],
          ...(interactive ? interactivePaint(theme) : {}),
          ...(dimmed ? dimmedPaint : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Stack>
  );
};
