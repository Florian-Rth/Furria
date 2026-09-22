import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { highlightMark, highlightPaint } from './internal/highlight-paint';
import { redInk } from './internal/red-ink';
import { rowDividerTop } from './internal/row-divider';
import { KkChip } from './KkChip';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const hoverPaint = (theme: Theme): CSSObject => ({
  '@media (hover: hover)': {
    '&:hover': {
      '& [data-kk-hub-row-label]': redInk(theme),
      '& [data-kk-hub-row-chevron]': { color: 'text.primary' },
    },
  },
});

interface KkHubRowProps {
  label: string;
  icon: KkIconName;
  meta?: string;
  hint?: string;
  highlight?: boolean;
  landing?: string;
  component?: ElementType;
  to?: string | null;
  sx?: KkSx;
}

export const KkHubRow: FC<KkHubRowProps> = ({
  label,
  icon,
  meta,
  hint,
  highlight = false,
  landing,
  component,
  to,
  sx,
}) => {
  const inert = to === undefined || to === null || component === undefined;
  const highlightProps = highlightMark(highlight);
  const rowComponent = inert ? 'div' : component;
  const routeProps = inert ? {} : { to };
  const labelColor = inert ? 'text.disabled' : 'text.primary';
  const iconColor = inert ? 'text.disabled' : 'text.secondary';

  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

  const hintChip =
    hint === undefined ? null : (
      <KkChip tone="neutral" size="small">
        {hint}
      </KkChip>
    );

  const chevron = inert ? null : (
    <Box
      component="span"
      data-kk-hub-row-chevron
      sx={{ display: 'inline-flex', color: 'text.secondary', flexShrink: 0 }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  );

  return (
    <Stack
      component={rowComponent}
      {...routeProps}
      {...highlightProps}
      direction="row"
      data-kk-hub-row
      data-kk-landing={landing}
      sx={[
        (theme) => ({
          width: '100%',
          minWidth: 0,
          minHeight: kkTokens.tapTarget,
          alignItems: 'center',
          gap: 1.5,
          m: 0,
          px: 0,
          py: 1.25,
          color: 'inherit',
          textAlign: 'left',
          textDecoration: 'none',
          cursor: inert ? 'default' : 'pointer',
          ...rowDividerTop,
          ...focusRing(theme),
          ...(inert ? {} : hoverPaint(theme)),
          ...(highlight ? highlightPaint(theme) : {}),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkIcon name={icon} size="small" sx={{ color: iconColor, flexShrink: 0 }} />
      <Stack component="span" sx={{ flexGrow: 1, minWidth: 0, gap: 0.25 }}>
        <Typography
          component="span"
          data-kk-hub-row-label
          sx={{
            fontFamily: kkTokens.font.display,
            fontWeight: kkTokens.font.displayWeight,
            fontSize: kkTokens.type.rowValue,
            letterSpacing: kkTokens.type.tracking.display,
            lineHeight: 1.3,
            color: labelColor,
            minWidth: 0,
          }}
        >
          {label}
        </Typography>
        {metaLine}
      </Stack>
      {hintChip}
      {chevron}
    </Stack>
  );
};
