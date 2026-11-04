import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { inkWashSurface } from './internal/ink-wash';
import { KkIcon } from './KkIcon';
import { KkIconButton } from './KkIconButton';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const linkPaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  gap: 0.75,
  minHeight: kkTokens.tapTarget,
  px: 1.75,
  borderRadius: `${kkTokens.radius.pill}px`,
  typography: 'button',
  color: 'background.paper',
  backgroundColor: 'text.primary',
  whiteSpace: 'nowrap',
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': { opacity: 0.88 } },
});

interface KkTabPayProps {
  label: string;
  payee: string;
  note: string | null;
  link: string | null;
  linkLabel: string;
  copyLabel: string;
  copied: boolean;
  copiedLabel: string;
  onCopy: () => void;
  sx?: KkSx;
}

export const KkTabPay: FC<KkTabPayProps> = ({
  label,
  payee,
  note,
  link,
  linkLabel,
  copyLabel,
  copied,
  copiedLabel,
  onCopy,
  sx,
}) => {
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
  const noteRow =
    note === null ? null : (
      <Stack
        direction="row"
        sx={(theme) => ({
          alignItems: 'center',
          gap: 0.5,
          minWidth: 0,
          pl: 1.25,
          pr: 0.25,
          py: 0.25,
          borderRadius: `${kkTokens.radius.base - 4}px`,
          ...inkWashSurface(theme, '4%', '7%'),
        })}
      >
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            typography: 'body2',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1.35,
            color: 'text.primary',
            overflowWrap: 'anywhere',
            userSelect: 'all',
          }}
        >
          {note}
        </Box>
        <KkIconButton
          label={copied ? copiedLabel : copyLabel}
          icon={copied ? 'check' : 'copy'}
          size="small"
          onClick={onCopy}
        />
      </Stack>
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
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.125 }}>
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
        {linkButton}
      </Stack>
      {noteRow}
    </Stack>
  );
};
