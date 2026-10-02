import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkTokens } from '../../../tokens';
import { DENSE_GAP, FACT_YIELD, factHoldPaint, insetFocusRing } from '../dense-panel-paint';
import type { KkDenseMeta } from '../logic/facet-pieces';
import { facetPiecesOf } from '../logic/facet-pieces';
import type { KkDenseMetaTone } from './KkDensePanelLineMeta';
import { KkDensePanelLineMeta } from './KkDensePanelLineMeta';

const FACT_FRAME: CSSObject = {
  flex: '1 1 0',
  alignSelf: 'stretch',
  justifyContent: 'center',
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  m: 0,
  p: 0,
  border: 0,
  color: 'inherit',
  textAlign: 'left',
  textDecoration: 'none',
  backgroundColor: 'transparent',
  appearance: 'none',
};

const FACT_ROW: CSSObject = {
  alignItems: 'baseline',
  gap: DENSE_GAP,
  minWidth: 0,
};

const HIDDEN_LABEL_ANCHOR: CSSObject = { position: 'relative' };

const titlePaintOf =
  (holds: boolean) =>
  (theme: Theme): CSSObject => ({
    color: 'inherit',
    ...(holds ? factHoldPaint(theme) : FACT_YIELD),
  });

const reachPaint = (theme: Theme): CSSObject => ({
  cursor: 'pointer',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
  },
  '&:focus-visible': { outline: 'none' },
  '&:focus-visible::after': insetFocusRing(theme),
  '@media (hover: hover)': {
    '&:hover [data-kk-dense-title]': redInk(theme),
  },
});

interface KkDensePanelLineFactProps {
  title: string;
  meta: KkDenseMeta | undefined;
  metaTone: KkDenseMetaTone;
  accessibleLabel: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
  onClick?: () => void;
}

export const KkDensePanelLineFact: FC<KkDensePanelLineFactProps> = ({
  title,
  meta,
  metaTone,
  accessibleLabel,
  component,
  to,
  params,
  search,
  onClick,
}) => {
  const reaches = component !== undefined || onClick !== undefined;
  const factComponent = component ?? (onClick === undefined ? 'div' : 'button');
  const routeProps = component === undefined ? {} : { to, params, search };
  const nativeProps = factComponent === 'button' ? { type: 'button' as const } : {};
  const pieces = facetPiecesOf(meta);
  const titleHolds = pieces.length > 0 && metaTone === 'muted';
  const metaLine =
    pieces.length === 0 ? null : <KkDensePanelLineMeta pieces={pieces} tone={metaTone} />;

  return (
    <Stack
      component={factComponent}
      {...routeProps}
      {...nativeProps}
      onClick={onClick}
      data-kk-dense-fact
      sx={[FACT_FRAME, reaches && reachPaint]}
    >
      <Stack component="span" sx={HIDDEN_LABEL_ANCHOR}>
        <KkVisuallyHidden>{accessibleLabel}</KkVisuallyHidden>
      </Stack>
      <Stack component="span" direction="row" aria-hidden sx={FACT_ROW}>
        <Typography
          component="span"
          variant="subtitle2"
          noWrap
          data-kk-dense-title
          sx={titlePaintOf(titleHolds)}
        >
          {title}
        </Typography>
        {metaLine}
      </Stack>
    </Stack>
  );
};
