import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { focusRing } from './internal/focus-ring';
import { highlightMark, highlightPaint } from './internal/highlight-paint';
import { redInk } from './internal/red-ink';
import { rowDividerTop } from './internal/row-divider';
import type { KkChipTone } from './KkChip';
import { KkChip } from './KkChip';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import { KkMeta } from './KkMeta';
import type { KkLinkSearch } from './kk-link-search';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const ACTION_GAP = 0.5;

const hoverPaint = (theme: Theme): CSSObject => ({
  '@media (hover: hover)': {
    '&:hover': {
      '& [data-kk-hub-row-label]': redInk(theme),
      '& [data-kk-hub-row-chevron]': { color: 'text.primary' },
    },
  },
});

const linkPaint = (theme: Theme, inert: boolean): CSSObject => ({
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
  ...focusRing(theme),
  ...(inert ? {} : hoverPaint(theme)),
});

const rowFrame = (theme: Theme, highlight: boolean): CSSObject => ({
  width: '100%',
  minWidth: 0,
  ...rowDividerTop,
  ...(highlight ? highlightPaint(theme) : {}),
});

interface KkHubRowProps {
  label: string;
  icon: KkIconName;
  meta?: string;
  hint?: string;
  hintTone?: KkChipTone;
  flag?: string;
  highlight?: boolean;
  landing?: string;
  component?: ElementType;
  to?: string | null;
  search?: KkLinkSearch;
  action?: ReactNode;
  sx?: KkSx;
}

export const KkHubRow: FC<KkHubRowProps> = ({
  label,
  icon,
  meta,
  hint,
  hintTone = 'neutral',
  flag,
  highlight = false,
  landing,
  component,
  to,
  search,
  action,
  sx,
}) => {
  const inert = to === undefined || to === null || component === undefined;
  const highlightProps = highlightMark(highlight);
  const rowComponent = inert ? 'div' : component;
  const searchProps = search === undefined ? {} : { search };
  const routeProps = inert ? {} : { to, ...searchProps };
  const labelColor = inert ? 'text.disabled' : 'text.primary';
  const iconColor = inert ? 'text.disabled' : 'text.secondary';
  const callerSx = Array.isArray(sx) ? sx : [sx];

  const metaLine = meta === undefined ? null : <KkMeta component="span">{meta}</KkMeta>;

  const flagChip =
    flag === undefined ? null : (
      <KkChip tone="gold" size="small">
        {flag}
      </KkChip>
    );

  const hintChip =
    hint === undefined ? null : (
      <KkChip tone={hintTone} size="small">
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

  const content = (
    <>
      <KkIcon name={icon} size="small" sx={{ color: iconColor, flexShrink: 0 }} />
      <Stack component="span" sx={{ flexGrow: 1, minWidth: 0, gap: 0.25 }}>
        <Typography
          component="span"
          data-kk-hub-row-label
          sx={{
            typography: 'h4',
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
      {flagChip}
      {hintChip}
      {chevron}
    </>
  );

  if (action === undefined) {
    return (
      <Stack
        component={rowComponent}
        {...routeProps}
        {...highlightProps}
        direction="row"
        data-kk-hub-row
        data-kk-landing={landing}
        sx={[
          (theme) => ({ ...rowFrame(theme, highlight), ...linkPaint(theme, inert) }),
          ...callerSx,
        ]}
      >
        {content}
      </Stack>
    );
  }

  return (
    <Stack
      {...highlightProps}
      direction="row"
      data-kk-hub-row
      data-kk-landing={landing}
      sx={[
        (theme) => ({ ...rowFrame(theme, highlight), alignItems: 'center', gap: ACTION_GAP }),
        ...callerSx,
      ]}
    >
      <Stack
        component={rowComponent}
        {...routeProps}
        direction="row"
        sx={(theme) => ({ flexGrow: 1, ...linkPaint(theme, inert) })}
      >
        {content}
      </Stack>
      {action}
    </Stack>
  );
};
