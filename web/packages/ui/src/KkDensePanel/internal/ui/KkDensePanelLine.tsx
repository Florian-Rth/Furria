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
  DENSE_GAP,
  DENSE_INNER_RADIUS,
  DENSE_INSET,
  DENSE_LINE_STACKED,
  DENSE_STACKED_SPINE,
  DENSE_TICK_HEIGHT,
  factRulePaint,
  LAST_LINE_OF_PANEL,
  stackedFactRulePaint,
} from '../dense-panel-paint';
import type { KkDenseMeta } from '../logic/facet-pieces';
import { toProgressWidth } from '../logic/progress-width';
import { useLineExpansion } from '../logic/use-line-expansion';
import { KkDensePanelLineFact } from './KkDensePanelLineFact';
import { KkDensePanelLineProgress } from './KkDensePanelLineProgress';
import { KkDensePanelLineTick } from './KkDensePanelLineTick';

export type KkDenseLineState = 'plain' | 'live' | 'dimmed';

const ENTER_OFFSET = 8;
const ENTER_FROM = { opacity: 0, y: -ENTER_OFFSET } as const;
const ENTER_TO = { opacity: 1, y: 0 } as const;
const STAMP_ROW = '&:has(> [data-kk-dense-spine] > [data-kk-dense-stamp])';
const STAMP_FOOT = 0.25;
const MARK_DROP = 0.5;
const SPINE = '& > [data-kk-dense-spine]';
const FACT = '& > [data-kk-dense-swap]';
const TRAILING = '& > [data-kk-dense-trailing]';
const EXPANDED = '& > [data-kk-dense-expanded]';
const ANSWER_TRAILING =
  '&:has(> [data-kk-dense-trailing] > :is([data-kk-answer-ring], [data-kk-answer-mark]))';
const EXPANDED_LINE = '&:has(> [data-kk-dense-row] > [data-kk-dense-expanded])';

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
    position: 'relative',
    minWidth: 0,
    '&:not(:first-of-type)': factRulePaint(theme),
    [LAST_LINE_OF_PANEL]: {
      borderBottomLeftRadius: DENSE_INNER_RADIUS,
      borderBottomRightRadius: DENSE_INNER_RADIUS,
      '& [data-kk-dense-fact]::after': {
        borderBottomLeftRadius: DENSE_INNER_RADIUS,
        borderBottomRightRadius: DENSE_INNER_RADIUS,
      },
      '& [data-kk-dense-progress]': { bottom: 0 },
    },
    [EXPANDED_LINE]: {
      '& > [data-kk-dense-tick]': {
        top: `calc((${kkTokens.tapTarget} - ${DENSE_TICK_HEIGHT}) / 2)`,
        transform: 'none',
      },
    },
    [DENSE_LINE_STACKED]: { '&:not(:first-of-type)': stackedFactRulePaint(theme) },
    ...statePaints[state](theme),
  });

const STACKED_STAMP_ROW: CSSObject = {
  alignItems: 'start',
  [SPINE]: { gridColumn: '1 / -1', gridRow: 1, alignSelf: 'start', mb: 0 },
  [FACT]: { gridColumn: '1 / 3', gridRow: 2, alignSelf: 'start', mb: 0 },
  [TRAILING]: { gridColumn: 3, gridRow: 2, alignSelf: 'center' },
  '& [data-kk-answer-ring]': { alignItems: 'center', pb: 0 },
  '& [data-kk-answer-mark]': { justifyContent: 'center', pb: 0 },
  [EXPANDED]: { gridColumn: '1 / -1', gridRow: 3 },
  '& [data-kk-dense-stamp]': { flexDirection: 'row', alignItems: 'baseline', columnGap: 1 },
  '& [data-kk-dense-eyebrow][data-empty]': { display: 'none' },
};

const ROW_FRAME: CSSObject = {
  display: 'grid',
  gridTemplateColumns: `${kkTokens.densePanel.anchor} minmax(0, 1fr) auto`,
  columnGap: DENSE_GAP,
  alignItems: 'center',
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  px: DENSE_INSET,
  [SPINE]: {
    gridColumn: 1,
    gridRow: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minWidth: 0,
  },
  [FACT]: { gridColumn: '2 / -1', gridRow: 1, minWidth: 0 },
  '&:has(> [data-kk-dense-trailing])': { [FACT]: { gridColumn: 2 } },
  [TRAILING]: { gridColumn: 3, gridRow: 1, alignSelf: 'center' },
  [ANSWER_TRAILING]: { [TRAILING]: { mr: -DENSE_INSET } },
  [EXPANDED]: { gridColumn: '2 / -1', gridRow: 2, alignSelf: 'center' },
  [STAMP_ROW]: {
    alignItems: 'last baseline',
    [SPINE]: { alignSelf: 'last baseline', mb: STAMP_FOOT },
    [FACT]: { mb: STAMP_FOOT },
    [TRAILING]: { alignSelf: 'stretch' },
    '& [data-kk-answer-ring]': { alignItems: 'flex-end', pb: MARK_DROP },
    '& [data-kk-answer-mark]': { justifyContent: 'flex-end', pb: MARK_DROP },
  },
  [DENSE_LINE_STACKED]: {
    gridTemplateColumns: `${DENSE_STACKED_SPINE} minmax(0, 1fr) auto`,
    alignItems: 'start',
    rowGap: 0.5,
    py: 1,
    [SPINE]: { alignSelf: 'start' },
    '&:has(> [data-kk-dense-trailing] > [data-kk-dense-aside])': {
      [FACT]: { gridColumn: '2 / -1' },
      [TRAILING]: { gridColumn: 2, gridRow: 2, justifySelf: 'start' },
    },
    [STAMP_ROW]: STACKED_STAMP_ROW,
  },
};

const TRAILING_FRAME: CSSObject = {
  position: 'relative',
  zIndex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  '& :is(button, a)': { pointerEvents: 'auto' },
};

const EXPANDED_FRAME: CSSObject = {
  position: 'relative',
  zIndex: 1,
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
  const expandedSlot = isExpanded ? (
    <Box
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
  ) : null;

  return (
    <Box
      ref={expansion.lineRef}
      component="li"
      inert={dimmed}
      {...highlightProps}
      data-kk-dense-line={state}
      sx={[linePaintOf(state), highlight && highlightPaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {tickMark}
      <Box data-kk-dense-row sx={ROW_FRAME}>
        <Stack aria-hidden data-kk-dense-spine>
          {anchor}
        </Stack>
        <Stack direction="row" data-kk-dense-swap>
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
        </Stack>
        {trailingSlot}
        {expandedSlot}
      </Box>
      {progressRule}
      {alertRegion}
    </Box>
  );
};
