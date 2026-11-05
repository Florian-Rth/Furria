import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const wayShape: CSSObject = {
  flex: '1 1 0',
  minWidth: 0,
  gap: 0.75,
  minHeight: kkTokens.tapTarget,
  px: 1.75,
  borderRadius: `${kkTokens.radius.pill}px`,
  typography: 'button',
  whiteSpace: 'nowrap',
};

const linkPaint = (theme: Theme): CSSObject => ({
  ...wayShape,
  color: 'background.paper',
  backgroundColor: 'text.primary',
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': { opacity: 0.88 } },
});

const cashPaint = (theme: Theme): CSSObject => ({
  ...wayShape,
  alignItems: 'center',
  justifyContent: 'center',
  color: 'text.primary',
  ...inkWashSurface(theme, '6%', '10%'),
});

interface KkTabPayProps {
  label: string;
  payee: string;
  cash: string;
  link: string | null;
  linkLabel: string;
  sx?: KkSx;
}

export const KkTabPay: FC<KkTabPayProps> = ({ label, payee, cash, link, linkLabel, sx }) => {
  const linkButton =
    link === null ? null : (
      <ButtonBase
        component="a"
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        data-kk-tab-pay-link
        sx={linkPaint}
      >
        {linkLabel}
        <KkIcon name="external" size="small" />
      </ButtonBase>
    );

  return (
    <Stack
      component="section"
      aria-label={label}
      data-kk-tab-pay
      sx={[
        {
          gap: 1,
          minWidth: 0,
          p: 1.25,
          bgcolor: 'background.paper',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack sx={{ minWidth: 0, gap: 0.125 }}>
        <Box
          component="span"
          sx={{
            typography: 'overline',
            fontWeight: 800,
            letterSpacing: kkTokens.type.tracking.label,
            textTransform: 'uppercase',
            lineHeight: 1.2,
            color: 'text.secondary',
          }}
        >
          {label}
        </Box>
        <Box
          component="span"
          sx={{
            typography: 'subtitle2',
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'text.primary',
          }}
        >
          {payee}
        </Box>
      </Stack>
      <Stack direction="row" sx={{ gap: 1, minWidth: 0 }}>
        <Stack direction="row" data-kk-tab-pay-cash sx={cashPaint}>
          <KkIcon name="fees" size="small" />
          {cash}
        </Stack>
        {linkButton}
      </Stack>
    </Stack>
  );
};
