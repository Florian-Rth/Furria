import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import type { KkEightsDensity } from '../logic/sheet-metrics';
import { rowHeightOf } from '../logic/sheet-metrics';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const TEMPLATE =
  'minmax(0, 0.95fr) minmax(0, 1.35fr) minmax(0, 5fr) minmax(0, 0.85fr) minmax(2.5rem, 0.5fr)';
const NARROW_TEMPLATE =
  'minmax(0, 0.8fr) minmax(0, 1.2fr) minmax(0, 5fr) minmax(0, 0.7fr) minmax(2.25rem, 0.45fr)';

interface KkEightsSheetRootProps extends PropsWithChildren {
  label: string;
  density: KkEightsDensity;
  columns: number;
  sx?: KkSx;
}

export const KkEightsSheetRoot: FC<KkEightsSheetRootProps> = ({
  label,
  density,
  columns,
  sx,
  children,
}) => {
  return (
    <Box
      component="section"
      role="group"
      aria-label={label}
      data-kk-eights-scroller
      data-density={density}
      sx={[
        (theme) => ({
          '--kk-eights-row': rowHeightOf(density),
          '--kk-eights-head': '2rem',
          '--kk-eights-columns': String(columns),
          position: 'relative',
          minHeight: 0,
          height: '100%',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          containerType: 'inline-size',
          containerName: 'kk-eights-sheet',
          borderRadius: `${kkTokens.radius.base}px`,
          backgroundColor: palette(theme).background.paper,
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
          scrollbarGutter: 'stable',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          position: 'relative',
          minWidth: 0,
          '--kk-eights-template': TEMPLATE,
          '@container kk-eights-sheet (max-width: 44rem)': {
            '--kk-eights-template': NARROW_TEMPLATE,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
