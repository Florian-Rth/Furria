import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { goldInkOf } from './internal/gold-ink';
import { stepFigures, stepLabel } from './KkStatePill/state-paint';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkLedgerFigureTone = 'ink' | 'attention' | 'quiet';

export interface KkLedgerFigure {
  key: string;
  label: string;
  value: ReactNode;
  tone?: KkLedgerFigureTone;
}

const LEAD_SPAN = 6;
const ROW_SPAN = 12;

const figureInk =
  (tone: KkLedgerFigureTone) =>
  (theme: Theme): CSSObject => {
    switch (tone) {
      case 'attention':
        return goldInkOf(theme);
      case 'quiet':
        return { color: 'text.secondary' };
      case 'ink':
        return { color: 'text.primary' };
    }
  };

interface KkLedgerHeadProps {
  label: string;
  figures: readonly KkLedgerFigure[];
  status?: ReactNode;
  sx?: KkSx;
}

export const KkLedgerHead: FC<KkLedgerHeadProps> = ({ label, figures, status, sx }) => {
  const cells = figures.map((figure, index) => {
    const lead = index === 0;
    const leadSpan = figures.length === 1 ? ROW_SPAN : LEAD_SPAN;
    const span = lead ? leadSpan : (ROW_SPAN - LEAD_SPAN) / (figures.length - 1);

    return (
      <Grid
        key={figure.key}
        size={span}
        sx={{
          minWidth: 0,
          px: lead ? 1.5 : 1.25,
          py: 1.25,
          borderLeftWidth: lead ? 0 : kkTokens.line.hair,
          borderLeftStyle: 'solid',
          borderLeftColor: 'divider',
        }}
      >
        <Stack sx={{ gap: 0.5, minWidth: 0 }}>
          <Box component="span" sx={stepLabel}>
            {figure.label}
          </Box>
          <Box
            component="span"
            sx={[
              {
                ...stepFigures,
                typography: lead ? 'h1' : 'h2',
                lineHeight: 1.1,
                whiteSpace: 'nowrap',
              },
              figureInk(figure.tone ?? 'ink'),
            ]}
          >
            {figure.value}
          </Box>
        </Stack>
      </Grid>
    );
  });
  const statusLine =
    status === undefined ? null : (
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderTopColor: 'divider',
        }}
      >
        {status}
      </Box>
    );

  return (
    <Stack
      component="section"
      aria-label={label}
      data-kk-ledger-head
      sx={[
        {
          position: 'relative',
          minWidth: 0,
          bgcolor: 'background.paper',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Grid container sx={{ alignItems: 'stretch' }}>
        {cells}
      </Grid>
      {statusLine}
    </Stack>
  );
};
