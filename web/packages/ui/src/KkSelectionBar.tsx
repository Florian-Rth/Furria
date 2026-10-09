import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { KkFlapCount } from './KkFlapCount';
import { KK_DARK_SCHEME_ATTRIBUTE } from './theme';
import { kkTokens } from './tokens';

const { gallery, shadow } = kkTokens;
const darkScheme = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

interface KkSelectionBarProps extends PropsWithChildren {
  label: string;
  count: string;
}

export const KkSelectionBar: FC<KkSelectionBarProps> = ({ label, count, children }) => (
  <Stack
    role="toolbar"
    aria-label={label}
    data-kk-selection-bar
    {...darkScheme}
    sx={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: (theme: Theme) => theme.zIndex.appBar + 2,
      rowGap: 1,
      px: 2,
      pt: 1.25,
      pb: 'max(env(safe-area-inset-bottom), 12px)',
      bgcolor: gallery.darkroom,
      color: 'text.primary',
      borderTop: `${kkTokens.line.page}px solid`,
      borderColor: 'primary.main',
      boxShadow: shadow.sheet,
    }}
  >
    <KkFlapCount value={count} variant="h3" tone="red" />
    <Stack direction="row" sx={{ columnGap: 1, rowGap: 1, flexWrap: 'wrap' }}>
      {children}
    </Stack>
  </Stack>
);
