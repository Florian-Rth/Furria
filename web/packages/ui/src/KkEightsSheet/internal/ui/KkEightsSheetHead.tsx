import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { headLabelOf, SHEET_COLUMNS, SHEET_HEAD, SHEET_TEMPLATE } from '../logic/sheet-metrics';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEightsSheetHeadProps {
  part: string;
  step: string;
  video: string;
  ways: string;
  columns: number;
}

const titleSx = (theme: Theme) => ({
  px: 1,
  minWidth: 0,
  alignSelf: 'center',
  fontWeight: kkTokens.eyebrow.fontWeight,
  letterSpacing: kkTokens.type.tracking.label,
  lineHeight: 1,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: palette(theme).text.secondary,
});

export const KkEightsSheetHead: FC<KkEightsSheetHeadProps> = ({
  part,
  step,
  video,
  ways,
  columns,
}) => {
  const counts = Array.from({ length: columns }, (_, column) => {
    const label = headLabelOf(column, columns);

    return (
      <Typography
        key={label + String(column)}
        variant="overline"
        data-downbeat={column % 8 === 0}
        sx={(theme) => ({
          ...titleSx(theme),
          px: 0.5,
          textAlign: 'left',
          fontVariantNumeric: 'tabular-nums',
          '&[data-downbeat="true"]': { color: palette(theme).text.primary },
        })}
      >
        {label}
      </Typography>
    );
  });

  return (
    <Box
      role="row"
      sx={(theme) => ({
        position: 'sticky',
        top: 0,
        zIndex: 4,
        display: 'grid',
        gridTemplateColumns: SHEET_TEMPLATE,
        height: SHEET_HEAD,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `inset 0 -${kkTokens.line.section}px 0 ${palette(theme).divider}`,
      })}
    >
      <Typography role="columnheader" variant="overline" sx={titleSx}>
        {part}
      </Typography>
      <Typography role="columnheader" variant="overline" sx={titleSx}>
        {step}
      </Typography>
      <Box
        role="columnheader"
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${SHEET_COLUMNS}, minmax(0, 1fr))`,
          minWidth: 0,
        }}
      >
        {counts}
      </Box>
      <Typography role="columnheader" variant="overline" sx={titleSx}>
        {video}
      </Typography>
      <Typography role="columnheader" variant="overline" sx={titleSx}>
        {ways}
      </Typography>
    </Box>
  );
};
