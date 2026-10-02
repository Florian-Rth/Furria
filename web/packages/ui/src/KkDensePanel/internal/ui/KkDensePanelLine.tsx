import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { ElementType, FC, ReactNode } from 'react';
import { accentWash } from '../../../internal/accent-wash';
import type { KkGroupTone } from '../../../internal/group-tone';
import { highlightMark, highlightPaint } from '../../../internal/highlight-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkMotion } from '../../../kk-motion';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import {
  DENSE_INNER_RADIUS,
  denseRowFrame,
  denseSpineFrame,
  factRulePaint,
  LAST_LINE_OF_PANEL,
} from '../dense-panel-paint';
import type { KkDenseMeta } from '../logic/facet-pieces';
import { toProgressWidth } from '../logic/progress-width';
import { useLineExpansion } from '../logic/use-line-expansion';
import { KkDensePanelLineFact } from './KkDensePanelLineFact';
import { KkDensePanelLineProgress } from './KkDensePanelLineProgress';
import { KkDensePanelLineTick } from './KkDensePanelLineTick';

export type KkDenseLineState = 'plain' | 'live' | 'dimmed';

const ENTER_OFFSET = 12;
const ENTER_FROM = { opacity: 0, x: ENTER_OFFSET } as const;
const ENTER_TO = { opacity: 1, x: 0 } as const;
const FADE_FROM = { opacity: 0 } as const;
const FADE_TO = { opacity: 1 } as const;

const statePaints: Record<KkDenseLineState, (theme: Theme) => CSSObject> = {
  plain: () => ({}),
  live: (theme) => accentWash(theme),
  dimmed: () => ({
    opacity: kkTokens.opacity.dimmed,
    '& [data-kk-dense-title]': { color: 'text.secondary' },
  }),
};

const linePaintOf =
  (state: KkDenseLineState) =>
  (theme: Theme): CSSObject => ({
    ...denseRowFrame,
    '&:not(:first-of-type)': factRulePaint(theme),
    [LAST_LINE_OF_PANEL]: {
      borderBottomLeftRadius: DENSE_INNER_RADIUS,
      borderBottomRightRadius: DENSE_INNER_RADIUS,
      '& [data-kk-dense-fact]::after': {
        borderBottomLeftRadius: DENSE_INNER_RADIUS,
        borderBottomRightRadius: DENSE_INNER_RADIUS,
      },
    },
    ...statePaints[state](theme),
  });

const SWAP_FRAME: CSSObject = {
  flex: '1 1 0',
  alignSelf: 'stretch',
  alignItems: 'center',
  gap: kkTokens.densePanel.gap,
  minWidth: 0,
};

const TRAILING_FRAME: CSSObject = {
  position: 'relative',
  zIndex: 1,
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  '& :is(button, a)': { pointerEvents: 'auto' },
};

const EXPANDED_FRAME: CSSObject = {
  position: 'relative',
  zIndex: 1,
  flex: '1 1 0',
  minWidth: 0,
};

const ALERT_FRAME: CSSObject = { position: 'absolute' };

interface KkDensePanelLineProps {
  anchor: ReactNode;
  title: string;
  accessibleLabel: string;
  meta?: KkDenseMeta;
  alert?: string;
  tick?: KkGroupTone;
  state?: KkDenseLineState;
  progress?: number | null;
  trailing?: ReactNode;
  expanded?: ReactNode;
  onCollapse?: () => void;
  highlight?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
  onClick?: () => void;
  sx?: KkSx;
}

export const KkDensePanelLine: FC<KkDensePanelLineProps> = ({
  anchor,
  title,
  accessibleLabel,
  meta,
  alert,
  tick,
  state = 'plain',
  progress,
  trailing,
  expanded,
  onCollapse,
  highlight = false,
  component,
  to,
  params,
  search,
  onClick,
  sx,
}) => {
  const isExpanded = expanded !== undefined && expanded !== null;
  const expansion = useLineExpansion(isExpanded, onCollapse);
  const reduced = useReducedMotion();
  const progressWidth = toProgressWidth(progress);
  const highlightProps = highlightMark(highlight);
  const dimmed = state === 'dimmed';
  const expandedEntry = reduced ? false : ENTER_FROM;
  const factEntry = reduced || !expansion.hasOpened ? false : FADE_FROM;
  const factMeta = alert ?? meta;
  const factMetaTone = alert === undefined ? 'muted' : 'alert';

  const tickMark = tick === undefined ? null : <KkDensePanelLineTick tone={tick} />;
  const progressRule =
    progressWidth === null ? null : <KkDensePanelLineProgress width={progressWidth} />;
  const alertRegion =
    alert === undefined ? null : (
      <Box component="span" role="alert" sx={ALERT_FRAME}>
        <KkVisuallyHidden>{alert}</KkVisuallyHidden>
      </Box>
    );
  const trailingSlot =
    trailing === undefined || trailing === null ? null : (
      <Stack direction="row" data-kk-dense-trailing sx={TRAILING_FRAME}>
        {trailing}
      </Stack>
    );

  const swap = isExpanded ? (
    <Box
      key="expanded"
      component={motion.div}
      initial={expandedEntry}
      animate={ENTER_TO}
      transition={kkMotion.layoutGlide}
      onFocus={expansion.enter}
      onBlur={expansion.leave}
      onKeyDown={expansion.dismiss}
      data-kk-dense-expanded
      sx={EXPANDED_FRAME}
    >
      {expanded}
    </Box>
  ) : (
    <Stack
      key="fact"
      component={motion.div}
      direction="row"
      initial={factEntry}
      animate={FADE_TO}
      transition={kkMotion.arrive}
      sx={SWAP_FRAME}
    >
      <KkDensePanelLineFact
        title={title}
        meta={factMeta}
        metaTone={factMetaTone}
        accessibleLabel={accessibleLabel}
        component={component}
        to={to}
        params={params}
        search={search}
        onClick={onClick}
      />
      {trailingSlot}
    </Stack>
  );

  return (
    <Stack
      ref={expansion.lineRef}
      component="li"
      direction="row"
      inert={dimmed}
      {...highlightProps}
      data-kk-dense-line={state}
      sx={[linePaintOf(state), highlight && highlightPaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {tickMark}
      <Stack aria-hidden sx={denseSpineFrame}>
        {anchor}
      </Stack>
      {swap}
      {progressRule}
      {alertRegion}
    </Stack>
  );
};
