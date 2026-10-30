import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { KkIcon } from '../../../KkIcon';
import type { KkLinkSearch } from '../../../kk-link-search';
import { kkTokens } from '../../../tokens';
import { PASS_EYEBROW, PASS_TABULAR, passFocus, passGoldInk, passRedInk } from '../pass-paint';

const LINE_FRAME: CSSObject = { alignItems: 'baseline', gap: 1, minWidth: 0, flexWrap: 'wrap' };
const WHEN_PAINT: CSSObject = { ...PASS_TABULAR, m: 0, fontWeight: 800, lineHeight: 1.3 };
const TITLE_PAINT: CSSObject = { ...lineClamp(1), m: 0, color: 'text.secondary', fontWeight: 600 };

const eyebrowPaintOf =
  (owed: boolean) =>
  (theme: Theme): CSSObject => ({
    ...PASS_EYEBROW,
    ...(owed ? passGoldInk(theme) : {}),
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
  '& [data-kk-pass-training-chevron]': { color: 'text.secondary', flexShrink: 0, ml: 'auto' },
  '@media (hover: hover)': {
    '&:hover [data-kk-pass-training-when], &:hover [data-kk-pass-training-chevron]':
      passRedInk(theme),
  },
});

interface KkPassCardTrainingProps extends PropsWithChildren {
  eyebrow: string;
  when: string;
  title?: string;
  tally?: string;
  owed?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  search?: KkLinkSearch;
}

export const KkPassCardTraining: FC<KkPassCardTrainingProps> = ({
  eyebrow,
  when,
  title,
  tally,
  owed = false,
  component,
  to,
  params,
  search,
  children,
}) => {
  const titleLine =
    title === undefined ? null : (
      <Typography component="span" variant="caption" sx={TITLE_PAINT}>
        {title}
      </Typography>
    );
  const tallyLine =
    tally === undefined ? null : (
      <Typography component="span" variant="caption" sx={TITLE_PAINT}>
        {tally}
      </Typography>
    );
  const chevron =
    component === undefined ? null : (
      <Box
        component="span"
        aria-hidden
        data-kk-pass-training-chevron
        sx={{ display: 'inline-flex' }}
      >
        <KkIcon name="chevron" size="small" />
      </Box>
    );
  const reach = component ?? 'div';
  const routeProps = component === undefined ? {} : { to, params, search };

  return (
    <Stack data-kk-pass-part data-kk-pass-training sx={{ gap: 0.75, minWidth: 0 }}>
      <Typography component="p" sx={eyebrowPaintOf(owed)}>
        {eyebrow}
      </Typography>
      <Box component={reach} {...routeProps} sx={reachPaint}>
        <Stack direction="row" sx={LINE_FRAME}>
          <Typography component="span" variant="body2" data-kk-pass-training-when sx={WHEN_PAINT}>
            {when}
          </Typography>
          {titleLine}
          {tallyLine}
        </Stack>
        {chevron}
      </Box>
      {children}
    </Stack>
  );
};
