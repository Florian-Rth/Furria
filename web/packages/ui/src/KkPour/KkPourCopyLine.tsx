import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useState } from 'react';
import { inkWash } from '../internal/ink-wash';
import { KkIconButton } from '../KkIconButton';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const COPIED_MS = 1800;

const linePaint = (theme: Theme): CSSObject => ({
  alignItems: 'center',
  gap: 1,
  pl: 1.25,
  pr: 0.5,
  py: 0.5,
  minWidth: 0,
  borderRadius: `${kkTokens.radius.base}px`,
  backgroundColor: inkWash(theme, '6%'),
});

interface KkPourCopyLineProps {
  text: string;
  copyLabel: string;
  copiedLabel: string;
  sx?: KkSx;
}

export const KkPourCopyLine: FC<KkPourCopyLineProps> = ({ text, copyLabel, copiedLabel, sx }) => {
  const [copied, setCopied] = useState(false);
  const copy = (): void => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => {
        setCopied(false);
      }, COPIED_MS);
    });
  };
  const label = copied ? copiedLabel : copyLabel;
  const icon = copied ? 'check' : 'copy';

  return (
    <Stack direction="row" data-kk-pour-copy sx={[linePaint, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          minWidth: 0,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          overflowWrap: 'anywhere',
        }}
      >
        {text}
      </Typography>
      <KkIconButton label={label} icon={icon} size="small" onClick={copy} />
    </Stack>
  );
};
