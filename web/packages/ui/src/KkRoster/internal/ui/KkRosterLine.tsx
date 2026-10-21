import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { highlightMark, highlightPaint } from '../../../internal/highlight-paint';
import { inkWashSurface } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import { COMPACT_SPANS, WIDE_SPANS } from '../roster-columns';

const linePaint =
  (selected: boolean, dimmed: boolean) =>
  (theme: Theme): CSSObject => ({
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 1.5,
    px: { xs: 1.5, md: 2 },
    py: 1,
    textAlign: 'left',
    borderRadius: `${kkTokens.radius.base}px`,
    opacity: dimmed ? kkTokens.opacity.dimmed : 1,
    ...(selected ? inkWashSurface(theme, '6%', '10%') : {}),
    ...focusRing(theme),
    '@media (hover: hover)': {
      '&:hover [data-kk-roster-name]': redInk(theme),
    },
  });

interface KkRosterLineProps {
  mark: ReactNode;
  name: string;
  flags?: ReactNode;
  openLabel: string;
  selected?: boolean;
  dimmed?: boolean;
  compact?: boolean;
  landing?: string;
  highlight?: boolean;
  onOpen: () => void;
  children?: ReactNode;
}

export const KkRosterLine: FC<KkRosterLineProps> = ({
  mark,
  name,
  flags,
  openLabel,
  selected = false,
  dimmed = false,
  compact = false,
  landing,
  highlight = false,
  onOpen,
  children,
}) => {
  const spans = compact ? COMPACT_SPANS : WIDE_SPANS;

  return (
    <Box
      component="li"
      data-kk-roster-line
      data-kk-landing={landing}
      {...highlightMark(highlight)}
      sx={(theme) => ({
        minWidth: 0,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderColor: 'divider',
        '&:first-of-type': { borderTopWidth: 0 },
        ...(highlight ? highlightPaint(theme) : {}),
      })}
    >
      <ButtonBase
        onClick={onOpen}
        aria-label={`${openLabel}: ${name}`}
        aria-current={selected ? 'true' : undefined}
        sx={linePaint(selected, dimmed)}
      >
        {mark}
        <Grid
          container
          component="span"
          columnSpacing={1.5}
          rowSpacing={0.25}
          sx={{
            flex: 1,
            minWidth: 0,
            alignItems: 'flex-start',
            alignContent: 'center',
            minHeight: '2.25rem',
          }}
        >
          <Grid
            component="span"
            size={{ xs: 'grow', md: spans.name }}
            sx={{ order: 1, minWidth: 0 }}
          >
            <Stack
              direction="row"
              component="span"
              data-kk-roster-name
              sx={{
                alignItems: 'center',
                minHeight: '1.75rem',
                typography: 'subtitle2',
                fontWeight: 800,
                lineHeight: 1.25,
                color: 'text.primary',
                overflowWrap: 'anywhere',
              }}
            >
              {name}
            </Stack>
          </Grid>
          <Grid
            component="span"
            size={{ xs: 12, md: spans.seats }}
            sx={{ order: { xs: 3, md: 2 }, minWidth: 0 }}
          >
            <Stack component="span" sx={{ minWidth: 0, gap: 0.25 }}>
              {children}
            </Stack>
          </Grid>
          <Grid
            component="span"
            size={{ xs: 'auto', md: spans.flags }}
            sx={{ order: { xs: 2, md: 3 }, minWidth: 0 }}
          >
            <Stack
              direction="row"
              component="span"
              sx={{
                justifyContent: { xs: 'flex-end', md: 'flex-start' },
                alignItems: 'center',
                gap: 1,
                minHeight: '1.75rem',
              }}
            >
              {flags}
            </Stack>
          </Grid>
        </Grid>
      </ButtonBase>
    </Box>
  );
};
