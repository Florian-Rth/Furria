import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkButton } from './KkButton';
import { KkIcon } from './KkIcon';
import { KkIconButton } from './KkIconButton';
import { stepFigures, stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkLedgerPayBlockProps {
  title: string;
  owner: string;
  linkLabel: string;
  href: string | null;
  note: string | null;
  copyLabel: string;
  copied: boolean;
  onCopy: () => void;
  sx?: KkSx;
}

export const KkLedgerPayBlock: FC<KkLedgerPayBlockProps> = ({
  title,
  owner,
  linkLabel,
  href,
  note,
  copyLabel,
  copied,
  onCopy,
  sx,
}) => {
  const linkButton =
    href === null ? null : (
      <KkButton
        variant="outlined"
        size="small"
        href={href}
        startIcon={<KkIcon name="external" sx={{ width: '1rem', height: '1rem' }} />}
        sx={{ flexShrink: 0 }}
      >
        {linkLabel}
      </KkButton>
    );
  const copyIcon = copied ? 'check' : 'copy';
  const noteLine =
    note === null ? null : (
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 0.5,
          pt: 0.75,
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: 'divider',
        }}
      >
        <Box
          component="span"
          sx={{
            ...stepFigures,
            flex: 1,
            minWidth: 0,
            typography: 'caption',
            fontWeight: 700,
            fontFamily: kkTokens.font.mono,
            overflowWrap: 'anywhere',
          }}
        >
          {note}
        </Box>
        <KkIconButton label={copyLabel} icon={copyIcon} size="small" onClick={onCopy} />
      </Stack>
    );

  return (
    <Stack
      component="section"
      aria-label={title}
      data-kk-ledger-pay
      sx={[
        {
          gap: 0.75,
          px: 1.5,
          py: 1.25,
          minWidth: 0,
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
          <Box component="span" sx={stepLabel}>
            {title}
          </Box>
          <Box component="span" sx={{ typography: 'body2', fontWeight: 700 }}>
            {owner}
          </Box>
        </Stack>
        {linkButton}
      </Stack>
      {noteLine}
    </Stack>
  );
};
