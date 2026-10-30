import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from './tokens';

export interface KkKeyListEntry {
  id: string;
  keys: readonly string[];
  action: string;
}

const keyCapPaint = (theme: Theme) => ({
  display: 'inline-block',
  minWidth: '1.75rem',
  px: 0.75,
  py: 0.125,
  borderRadius: `${kkTokens.radius.bar}px`,
  fontWeight: 800,
  textAlign: 'center',
  color: (theme.vars ?? theme).palette.text.primary,
  backgroundColor: (theme.vars ?? theme).palette.background.default,
  boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${(theme.vars ?? theme).palette.divider}, 0 ${kkTokens.line.hair}px 0 ${(theme.vars ?? theme).palette.divider}`,
});

interface KkKeyListProps {
  title: string;
  entries: readonly KkKeyListEntry[];
}

export const KkKeyList: FC<KkKeyListProps> = ({ title, entries }) => {
  const rows = entries.map((entry) => {
    const caps = entry.keys.map((key) => (
      <Typography key={key} component="kbd" variant="caption" sx={keyCapPaint}>
        {key}
      </Typography>
    ));

    return (
      <Box key={entry.id} sx={{ display: 'contents' }}>
        <Stack
          component="dt"
          direction="row"
          sx={{ gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}
        >
          {caps}
        </Stack>
        <Typography component="dd" variant="body2" sx={{ m: 0, alignSelf: 'center' }}>
          {entry.action}
        </Typography>
      </Box>
    );
  });

  return (
    <Stack component="section" aria-label={title} data-kk-key-list sx={{ gap: 1 }}>
      <Typography
        variant="overline"
        sx={{
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.eyebrow.letterSpacing,
          color: 'text.secondary',
        }}
      >
        {title}
      </Typography>
      <Box
        component="dl"
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          columnGap: 1.5,
          rowGap: 1,
          m: 0,
        }}
      >
        {rows}
      </Box>
    </Stack>
  );
};
