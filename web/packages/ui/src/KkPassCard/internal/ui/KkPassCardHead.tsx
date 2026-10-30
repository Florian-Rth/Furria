import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { KkIcon } from '../../../KkIcon';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkTokens } from '../../../tokens';
import { passFocus, passRedInk } from '../pass-paint';

export type KkPassCardHeadLevel = 1 | 2 | 3;

const HEAD_FRAME: CSSObject = {
  alignItems: 'center',
  gap: 1.5,
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
};

const TITLE_PAINT: CSSObject = {
  ...lineClamp(2),
  m: 0,
  letterSpacing: kkTokens.type.tracking.display,
  lineHeight: 1.1,
};

const META_PAINT: CSSObject = {
  ...lineClamp(2),
  m: 0,
  color: 'text.secondary',
  fontWeight: 700,
};

const linkPaint = (theme: Theme): CSSObject => ({
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  color: 'text.primary',
  textDecoration: 'none',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...passFocus(theme),
  '& [data-kk-pass-head-chevron]': { color: 'text.secondary', flexShrink: 0 },
  '@media (hover: hover)': {
    '&:hover [data-kk-pass-head-title], &:hover [data-kk-pass-head-chevron]': passRedInk(theme),
  },
});

const headingOf: Record<KkPassCardHeadLevel, 'h1' | 'h2' | 'h3'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
};

interface KkPassCardHeadProps {
  title: string;
  level: KkPassCardHeadLevel;
  titleHidden?: boolean;
  meta?: string;
  action?: ReactNode;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export const KkPassCardHead: FC<KkPassCardHeadProps> = ({
  title,
  level,
  titleHidden = false,
  meta,
  action,
  component,
  to,
  params,
  search,
}) => {
  const heading = headingOf[level];
  const visibleTitle = (
    <Typography component={heading} variant="h3" data-kk-pass-head-title sx={TITLE_PAINT}>
      {title}
    </Typography>
  );
  const hiddenTitle = (
    <Box component={heading} sx={{ m: 0 }}>
      <KkVisuallyHidden>{title}</KkVisuallyHidden>
    </Box>
  );
  const linked =
    component === undefined ? (
      visibleTitle
    ) : (
      <Box component={component} to={to} params={params} search={search} sx={linkPaint}>
        {visibleTitle}
        <Box component="span" aria-hidden data-kk-pass-head-chevron sx={{ display: 'inline-flex' }}>
          <KkIcon name="chevron" size="small" />
        </Box>
      </Box>
    );
  const titleSlot = titleHidden ? hiddenTitle : linked;
  const metaLine =
    meta === undefined ? null : (
      <Typography component="p" variant="caption" sx={META_PAINT}>
        {meta}
      </Typography>
    );

  return (
    <Stack
      direction="row"
      data-kk-pass-part
      data-kk-pass-head
      sx={[HEAD_FRAME, action === undefined && titleHidden && { minHeight: 0 }]}
    >
      <Stack sx={{ minWidth: 0, flex: 1, gap: 0.25 }}>
        {titleSlot}
        {metaLine}
      </Stack>
      {action}
    </Stack>
  );
};
