import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';
import { SHEET_ROW, SHEET_TEMPLATE } from '../logic/sheet-metrics';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsSheetRowProps extends PropsWithChildren {
  index: number;
  seconds: number;
  label: string;
  partStart: boolean;
}

export const KkEightsSheetRow: FC<KkEightsSheetRowProps> = ({
  index,
  seconds,
  label,
  partStart,
  children,
}) => (
  <Box
    role="row"
    aria-label={label}
    data-kk-eights-row
    data-row-index={index}
    data-seconds={seconds}
    data-part-start={partStart}
    sx={(theme) => ({
      display: 'grid',
      gridTemplateColumns: SHEET_TEMPLATE,
      height: SHEET_ROW,
      boxSizing: 'border-box',
      position: 'relative',
      boxShadow: `inset 0 -${kkTokens.line.hair}px 0 ${palette(theme).divider}`,
      '&[data-part-start="true"]': {
        boxShadow: `inset 0 -${kkTokens.line.hair}px 0 ${palette(theme).divider}, inset 0 ${kkTokens.line.section}px 0 ${palette(theme).text.primary}`,
      },
    })}
  >
    {children}
  </Box>
);
