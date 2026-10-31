import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkLaneInspectorLogRow {
  key: string;
  label: string;
  meta: string;
  hint: string | undefined;
}

interface KkLaneInspectorLogProps {
  label: string;
  rows: readonly KkLaneInspectorLogRow[];
}

export const KkLaneInspectorLog: FC<KkLaneInspectorLogProps> = ({ label, rows }) => {
  const items = rows.map((row) => {
    const hint =
      row.hint === undefined ? null : (
        <Typography
          component="span"
          variant="caption"
          sx={{ color: 'text.secondary', fontStyle: 'italic' }}
        >
          {row.hint}
        </Typography>
      );

    return (
      <Stack
        key={row.key}
        component="li"
        data-undone={row.hint !== undefined}
        sx={(theme) => ({
          py: 0.75,
          gap: 0.125,
          borderBottom: `${kkTokens.line.hair / 1.5}px solid ${palette(theme).divider}`,
          '&[data-undone="true"] > :first-of-type': { textDecoration: 'line-through' },
        })}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {row.label}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}
        >
          {row.meta}
        </Typography>
        {hint}
      </Stack>
    );
  });

  return (
    <Box component="ol" aria-label={label} sx={{ m: 0, p: 0, listStyle: 'none' }}>
      {items}
    </Box>
  );
};
