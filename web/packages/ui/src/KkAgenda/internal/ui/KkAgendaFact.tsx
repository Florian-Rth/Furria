import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { lineClamp } from '../../../internal/line-clamp';
import { redInk } from '../../../internal/red-ink';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkTokens } from '../../../tokens';

export type KkAgendaFactTone = 'plain' | 'quiet';

const FACT_BASIS = '7rem';

const linkPaint = (theme: Theme, inert: boolean): CSSObject => ({
  flex: `1 1 ${FACT_BASIS}`,
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  justifyContent: 'center',
  gap: 0.125,
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...focusRing(theme),
  ...(inert
    ? {}
    : { '@media (hover: hover)': { '&:hover [data-kk-agenda-title]': redInk(theme) } }),
});

const TITLE_PAINT: CSSObject = {
  ...lineClamp(2),
  overflowWrap: 'anywhere',
  fontWeight: 800,
  lineHeight: 1.25,
};

const linePaint = (tone: KkAgendaFactTone): CSSObject => ({
  fontWeight: 600,
  lineHeight: 1.35,
  fontVariantNumeric: 'tabular-nums',
  color: tone === 'quiet' ? 'text.disabled' : 'text.secondary',
});

interface KkAgendaFactProps {
  title: string;
  line: string;
  tone?: KkAgendaFactTone;
  component?: ElementType;
  to?: string;
  search?: KkLinkSearch;
}

export const KkAgendaFact: FC<KkAgendaFactProps> = ({
  title,
  line,
  tone = 'plain',
  component,
  to,
  search,
}) => {
  const inert = component === undefined || to === undefined;
  const routeProps = inert ? {} : { to, ...(search === undefined ? {} : { search }) };

  return (
    <Stack
      component={inert ? 'div' : component}
      {...routeProps}
      data-kk-agenda-fact
      sx={(theme) => linkPaint(theme, inert)}
    >
      <Typography component="span" variant="body2" data-kk-agenda-title sx={TITLE_PAINT}>
        {title}
      </Typography>
      <Typography component="span" variant="caption" sx={linePaint(tone)}>
        {line}
      </Typography>
    </Stack>
  );
};
