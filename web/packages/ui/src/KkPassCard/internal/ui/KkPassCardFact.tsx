import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkTokens } from '../../../tokens';
import { PASS_EYEBROW, PASS_TABULAR, passFocus, passRedInk } from '../pass-paint';

const { light, dark } = kkTokens.color;

const factPaintOf =
  (quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    alignItems: 'baseline',
    columnGap: 1,
    rowGap: 0.25,
    flexWrap: 'wrap',
    minWidth: 0,
    ...(quiet
      ? {
          px: 1.25,
          py: 0.75,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'dashed',
          borderRadius: `${kkTokens.radius.bar * 2}px`,
          ...applyScheme(theme, schemeEdge(light.line, dark.line)),
        }
      : {}),
  });

const valuePaintOf = (quiet: boolean): CSSObject => ({
  ...PASS_TABULAR,
  m: 0,
  minWidth: 0,
  fontWeight: quiet ? 600 : 800,
  color: quiet ? 'text.secondary' : 'text.primary',
});

const reachPaint = (theme: Theme): CSSObject => ({
  display: 'flex',
  alignItems: 'center',
  gap: 1,
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...passFocus(theme),
  '& [data-kk-pass-fact-chevron]': { color: 'text.secondary', flexShrink: 0, ml: 'auto' },
  '@media (hover: hover)': { '&:hover [data-kk-pass-fact-value]': passRedInk(theme) },
});

interface KkPassCardFactProps {
  label: string;
  value: string;
  quiet?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export const KkPassCardFact: FC<KkPassCardFactProps> = ({
  label,
  value,
  quiet = false,
  component,
  to,
  params,
  search,
}) => {
  const line = (
    <Stack component="p" direction="row" sx={[factPaintOf(quiet), { m: 0 }]}>
      <Box component="span" sx={PASS_EYEBROW}>
        {label}
      </Box>
      <Typography component="span" variant="body2" data-kk-pass-fact-value sx={valuePaintOf(quiet)}>
        {value}
      </Typography>
    </Stack>
  );

  if (component === undefined) {
    return (
      <Stack data-kk-pass-part data-kk-pass-fact sx={{ minWidth: 0 }}>
        {line}
      </Stack>
    );
  }

  return (
    <Stack data-kk-pass-part data-kk-pass-fact sx={{ minWidth: 0 }}>
      <Box component={component} to={to} params={params} search={search} sx={reachPaint}>
        {line}
        <Box component="span" aria-hidden data-kk-pass-fact-chevron sx={{ display: 'inline-flex' }}>
          <KkIcon name="chevron" size="small" />
        </Box>
      </Box>
    </Stack>
  );
};
