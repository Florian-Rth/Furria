import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkLaneInspectorFact {
  key: string;
  term: string;
  value: string;
}

interface KkLaneInspectorFactsProps {
  facts: readonly KkLaneInspectorFact[];
}

export const KkLaneInspectorFacts: FC<KkLaneInspectorFactsProps> = ({ facts }) => {
  const rows = facts.map((fact) => (
    <Box
      key={fact.key}
      sx={(theme) => ({
        display: 'contents',
        '& > *': {
          py: 0.5,
          borderBottom: `${kkTokens.line.hair / 1.5}px solid ${palette(theme).divider}`,
        },
      })}
    >
      <Typography
        component="dt"
        variant="caption"
        sx={{ color: 'text.secondary', lineHeight: 1.3 }}
      >
        {fact.term}
      </Typography>
      <Typography
        component="dd"
        variant="body2"
        sx={{
          m: 0,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          textAlign: 'right',
          lineHeight: 1.3,
          overflowWrap: 'anywhere',
        }}
      >
        {fact.value}
      </Typography>
    </Box>
  ));

  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        columnGap: 1.5,
        alignItems: 'baseline',
      }}
    >
      {rows}
    </Box>
  );
};
