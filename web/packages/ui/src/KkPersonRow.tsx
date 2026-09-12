import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { personRowMetrics } from './internal/person-row-metrics';
import { rowDividerTop } from './internal/row-divider';
import { KkAvatar } from './KkAvatar';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { resolvePersonRowAffiliation } from './person-row-affiliation';
import { kkTokens } from './tokens';

const clampedLine = {
  display: 'block',
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

interface KkPersonRowProps {
  initials: string;
  name: string;
  accent?: string;
  meta?: string;
  emptyMeta?: string;
  trailing?: ReactNode;
  dimmed?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  sx?: KkSx;
}

const hoverPaint: CSSObject = {
  '@media (hover: hover)': {
    '&:hover': {
      '& [data-kk-person-row-name]': { color: 'primary.main' },
      '& [data-kk-person-row-chevron]': { color: 'text.primary' },
    },
  },
};

export const KkPersonRow: FC<KkPersonRowProps> = ({
  initials,
  name,
  accent,
  meta,
  emptyMeta,
  trailing,
  dimmed = false,
  component,
  to,
  params,
  onClick,
  sx,
}) => {
  const affiliation = resolvePersonRowAffiliation({ accent, meta, emptyMeta });
  const interactive = component !== undefined || onClick !== undefined;
  const rowComponent = component ?? (onClick === undefined ? 'div' : 'button');
  const routeProps = component === undefined ? {} : { to, params };
  const nativeProps = rowComponent === 'button' ? { type: 'button' as const } : {};
  const hasSecondLine = affiliation.present || trailing !== undefined;
  const nameColor = dimmed ? 'text.secondary' : 'text.primary';

  const accentPart =
    affiliation.accent === null ? null : (
      <Box component="span" sx={{ color: 'primary.main' }}>
        {affiliation.accent}
      </Box>
    );

  const metaPart =
    affiliation.meta === null ? null : (
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {affiliation.meta}
      </Box>
    );

  const emptyPart =
    affiliation.empty === null ? null : (
      <Box component="span" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        {affiliation.empty}
      </Box>
    );

  const affiliationLine = affiliation.present ? (
    <Typography
      component="span"
      sx={{
        fontSize: kkTokens.type.rowMeta,
        fontWeight: 700,
        lineHeight: 1.3,
        color: 'text.secondary',
        ...clampedLine,
      }}
    >
      {accentPart}
      {metaPart}
      {emptyPart}
    </Typography>
  ) : null;

  const inlineTrailing =
    trailing === undefined ? null : (
      <Box component="span" sx={{ display: { xs: 'inline-flex', desktop: 'none' }, flexShrink: 0 }}>
        {trailing}
      </Box>
    );

  const slotTrailing =
    trailing === undefined ? null : (
      <Box component="span" sx={{ display: { xs: 'none', desktop: 'inline-flex' }, flexShrink: 0 }}>
        {trailing}
      </Box>
    );

  const secondLine = hasSecondLine ? (
    <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: 0.875, minWidth: 0 }}>
      {affiliationLine}
      {inlineTrailing}
    </Stack>
  ) : null;

  const chevron = interactive ? (
    <Box
      component="span"
      data-kk-person-row-chevron
      sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  ) : null;

  return (
    <Stack
      component={rowComponent}
      {...routeProps}
      {...nativeProps}
      onClick={onClick}
      direction="row"
      data-kk-person-row
      sx={[
        (theme) => ({
          width: '100%',
          minWidth: 0,
          alignItems: 'center',
          gap: personRowMetrics.gap,
          m: 0,
          px: 0,
          py: personRowMetrics.paddingY,
          appearance: 'none',
          backgroundColor: 'transparent',
          color: 'inherit',
          textAlign: 'left',
          textDecoration: 'none',
          borderWidth: 0,
          borderStyle: 'solid',
          cursor: interactive ? 'pointer' : 'default',
          ...rowDividerTop,
          ...focusRing(theme),
          ...(interactive ? hoverPaint : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkAvatar
        initials={initials}
        component="span"
        sx={{ flexShrink: 0, opacity: dimmed ? kkTokens.opacity.dimmed : 1 }}
      />
      <Stack component="span" sx={{ flexGrow: 1, minWidth: 0, gap: personRowMetrics.lineGap }}>
        <Typography
          component="span"
          data-kk-person-row-name
          sx={{
            fontSize: kkTokens.type.rowTitle,
            fontWeight: 800,
            lineHeight: 1.25,
            color: nameColor,
            ...clampedLine,
          }}
        >
          {name}
        </Typography>
        {secondLine}
      </Stack>
      {slotTrailing}
      {chevron}
    </Stack>
  );
};
