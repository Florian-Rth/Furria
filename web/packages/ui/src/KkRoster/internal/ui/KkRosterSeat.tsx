import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { KkAvatar } from '../../../KkAvatar/KkAvatar';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { HOLDER_SPAN, SINCE_SPAN } from '../roster-columns';

export type KkRosterSinceTone = 'ink' | 'attention';

const sinceInk = (theme: Theme, tone: KkRosterSinceTone): CSSObject =>
  tone === 'attention' ? goldInkOf(theme) : { color: 'text.secondary' };

interface KkRosterSeatProps {
  initials: string;
  name: string;
  since?: string;
  sinceTone?: KkRosterSinceTone;
}

export const KkRosterSeat: FC<KkRosterSeatProps> = ({
  initials,
  name,
  since,
  sinceTone = 'ink',
}) => {
  const sinceCell =
    since === undefined ? null : (
      <Grid component="span" size={{ xs: 'auto', md: SINCE_SPAN }} sx={{ minWidth: 0 }}>
        <Box
          component="span"
          sx={(theme) => ({
            ...stepFigures,
            display: 'block',
            textAlign: { xs: 'right', md: 'left' },
            typography: 'caption',
            fontWeight: 700,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            ...sinceInk(theme, sinceTone),
          })}
        >
          {since}
        </Box>
      </Grid>
    );

  return (
    <Grid
      container
      component="span"
      columnSpacing={1.5}
      data-kk-roster-seat
      sx={{ alignItems: 'center', minWidth: 0, minHeight: '1.75rem' }}
    >
      <Grid component="span" size={{ xs: 'grow', md: HOLDER_SPAN }} sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          component="span"
          sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}
        >
          <KkAvatar initials={initials} size="small" component="span" />
          <Box
            component="span"
            sx={{
              flex: 1,
              minWidth: 0,
              typography: 'body2',
              fontWeight: 600,
              lineHeight: 1.25,
              color: 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            {name}
          </Box>
        </Stack>
      </Grid>
      {sinceCell}
    </Grid>
  );
};
