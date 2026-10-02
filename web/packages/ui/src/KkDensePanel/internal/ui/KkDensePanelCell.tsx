import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkTokens } from '../../../tokens';
import {
  DENSE_CELLS_TWO_UP,
  DENSE_INNER_RADIUS,
  DENSE_INSET,
  insetFocusRing,
} from '../dense-panel-paint';

const { hair } = kkTokens.line;
const { light, dark } = kkTokens.color;
const CHEVRON_ROOM = 4;
const CHEVRON_INSET = 1;

const GROUT_PAINT: CSSObject = {
  minWidth: 0,
  borderStyle: 'solid',
  borderWidth: 0,
  borderColor: 'divider',
  '&:not(:first-of-type)': { borderTopWidth: hair },
  '&:last-of-type > *': {
    borderBottomLeftRadius: DENSE_INNER_RADIUS,
    borderBottomRightRadius: DENSE_INNER_RADIUS,
  },
  [DENSE_CELLS_TWO_UP]: {
    '&:nth-of-type(2)': { borderTopWidth: 0 },
    '&:nth-of-type(even)': { borderLeftWidth: hair },
    '&:last-of-type:nth-of-type(odd)': { gridColumn: '1 / -1' },
    '&:last-of-type:nth-of-type(even) > *': { borderBottomLeftRadius: 0 },
    '&:nth-last-of-type(2):nth-of-type(odd) > *': { borderBottomLeftRadius: DENSE_INNER_RADIUS },
  },
};

const CELL_FRAME: CSSObject = {
  position: 'relative',
  justifyContent: 'center',
  height: '100%',
  minWidth: 0,
  minHeight: kkTokens.densePanel.cell,
  px: DENSE_INSET,
  py: 0.75,
  color: 'inherit',
  textDecoration: 'none',
};

const reachPaint = (theme: Theme): CSSObject => ({
  cursor: 'pointer',
  pr: CHEVRON_ROOM,
  '&:focus-visible': insetFocusRing(theme),
  '&:active': applyScheme(theme, schemeFill(light.line2, dark.line2)),
  '@media (hover: hover)': {
    '&:hover [data-kk-dense-cell-value]': redInk(theme),
  },
});

const chevronPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: '50%',
  right: theme.spacing(CHEVRON_INSET),
  transform: 'translateY(-50%)',
  color: 'text.secondary',
});

const VALUE_PAINT: CSSObject = {
  color: 'text.primary',
  lineHeight: 1,
  letterSpacing: kkTokens.type.tracking.display,
};

const DIMMED_PAINT: CSSObject = {
  opacity: kkTokens.opacity.dimmed,
  '& [data-kk-dense-cell-value]': { color: 'text.secondary' },
};

const LABEL_PAINT: CSSObject = {
  color: 'text.secondary',
  fontWeight: 700,
  letterSpacing: kkTokens.type.tracking.tight,
};

interface KkDensePanelCellProps {
  value: number | string;
  label: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
  dimmed?: boolean;
}

export const KkDensePanelCell: FC<KkDensePanelCellProps> = ({
  value,
  label,
  component,
  to,
  params,
  search,
  dimmed = false,
}) => {
  const reaches = component !== undefined && !dimmed;
  const cellComponent = reaches ? component : 'div';
  const routeProps = reaches ? { to, params, search } : {};
  const chevron = reaches ? <KkIcon name="chevron" size="small" sx={chevronPaint} /> : null;

  return (
    <Box component="li" inert={dimmed} data-kk-dense-cell sx={GROUT_PAINT}>
      <Stack
        component={cellComponent}
        {...routeProps}
        sx={[CELL_FRAME, reaches && reachPaint, dimmed && DIMMED_PAINT]}
      >
        <Typography component="span" variant="h2" data-kk-dense-cell-value sx={VALUE_PAINT}>
          {value}
        </Typography>
        <Typography component="span" variant="caption" noWrap sx={LABEL_PAINT}>
          {label}
        </Typography>
        {chevron}
      </Stack>
    </Box>
  );
};
