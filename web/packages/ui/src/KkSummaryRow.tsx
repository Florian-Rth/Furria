import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { raisedSurface } from './internal/raised-surface';
import { redInk } from './internal/red-ink';
import { rowDividerTop } from './internal/row-divider';
import { KkEyebrow } from './KkEyebrow';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export interface KkSummaryFact {
  label: string;
  value: string;
}

const NO_FACTS: readonly KkSummaryFact[] = [];
const FACT_COLUMN_WIDTH = 96;

const clampedLine = {
  display: 'block',
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

interface KkSummaryRowProps {
  title: string;
  meta?: string;
  facts?: readonly KkSummaryFact[];
  trailing?: ReactNode;
  compactTrailing?: ReactNode;
  selected?: boolean;
  dimmed?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  sx?: KkSx;
}

export const KkSummaryRow: FC<KkSummaryRowProps> = ({
  title,
  meta,
  facts = NO_FACTS,
  trailing,
  compactTrailing,
  selected = false,
  dimmed = false,
  component,
  to,
  params,
  onClick,
  sx,
}) => {
  const interactive = component !== undefined || onClick !== undefined;
  const rowComponent = component ?? (onClick === undefined ? 'div' : 'button');
  const routeProps = component === undefined ? {} : { to, params };
  const nativeProps = rowComponent === 'button' ? { type: 'button' as const } : {};
  const current = selected ? true : undefined;
  const titleColor = dimmed ? 'text.secondary' : 'text.primary';

  const metaLine =
    meta === undefined ? null : (
      <KkMeta component="span" sx={{ ...clampedLine, display: { xs: 'block', desktop: 'none' } }}>
        {meta}
      </KkMeta>
    );

  const factCells = facts.map((fact) => (
    <Stack
      key={fact.label}
      component="span"
      sx={{ width: FACT_COLUMN_WIDTH, flexShrink: 0, gap: 0.25, minWidth: 0 }}
    >
      <KkEyebrow tone="muted" size="small" sx={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
        {fact.label}
      </KkEyebrow>
      <Typography
        component="span"
        sx={{
          fontSize: kkTokens.type.rowMeta,
          fontWeight: 800,
          lineHeight: 1.2,
          color: 'text.primary',
          ...clampedLine,
        }}
      >
        {fact.value}
      </Typography>
    </Stack>
  ));

  const factRow =
    factCells.length === 0 ? null : (
      <Stack
        component="span"
        direction="row"
        data-kk-summary-row-facts
        sx={{ display: { xs: 'none', desktop: 'flex' }, gap: 2, flexShrink: 0 }}
      >
        {factCells}
      </Stack>
    );

  const trailingSlot =
    trailing === undefined ? null : (
      <Box component="span" sx={{ display: { xs: 'none', desktop: 'inline-flex' }, flexShrink: 0 }}>
        {trailing}
      </Box>
    );

  const chevron = interactive ? (
    <Box
      component="span"
      data-kk-summary-row-chevron
      sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  ) : null;

  const compactTrailingSlot =
    compactTrailing === undefined ? null : (
      <Box component="span" sx={{ display: { xs: 'inline-flex', desktop: 'none' }, flexShrink: 0 }}>
        {compactTrailing}
      </Box>
    );

  return (
    <Stack
      component={rowComponent}
      {...routeProps}
      {...nativeProps}
      onClick={onClick}
      aria-current={current}
      direction="row"
      data-kk-summary-row
      sx={[
        (theme) => ({
          width: '100%',
          minWidth: 0,
          minHeight: kkTokens.tapTarget,
          alignItems: 'center',
          gap: 1.5,
          m: 0,
          px: 0,
          py: 1.375,
          appearance: 'none',
          backgroundColor: 'transparent',
          color: 'inherit',
          textAlign: 'left',
          textDecoration: 'none',
          borderWidth: 0,
          borderStyle: 'solid',
          cursor: interactive ? 'pointer' : 'default',
          ...rowDividerTop,
          ...(selected ? raisedSurface(theme) : {}),
          ...focusRing(theme),
          '@media (hover: hover)': {
            '&:hover': {
              '& [data-kk-summary-row-title]': redInk(theme),
              '& [data-kk-summary-row-chevron]': { color: 'text.primary' },
            },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack component="span" sx={{ flexGrow: 1, minWidth: 0, gap: 0.375 }}>
        <Typography
          component="span"
          data-kk-summary-row-title
          sx={{
            fontSize: kkTokens.type.rowTitle,
            fontWeight: 800,
            lineHeight: 1.25,
            color: titleColor,
            ...clampedLine,
          }}
        >
          {title}
        </Typography>
        {metaLine}
      </Stack>
      {factRow}
      {trailingSlot}
      {compactTrailingSlot}
      {chevron}
    </Stack>
  );
};
