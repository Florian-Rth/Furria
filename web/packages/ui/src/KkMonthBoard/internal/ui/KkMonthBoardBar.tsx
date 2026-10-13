import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { kkTokens } from '../../../tokens';
import type { KkPlacedBar } from '../logic/month-board-lanes';

const { monthBoard, radius, motion } = kkTokens;
const ROUNDED = `${radius.bar}px`;
const SQUARE = 0;
const LANE_ROW_OFFSET = 2;

const fillPaint =
  (placed: KkPlacedBar) =>
  (theme: Theme): CSSObject => {
    const tone = placed.bar.tone;

    if (tone !== null) {
      return groupToneFieldPaint(theme, tone);
    }

    const palette = (theme.vars ?? theme).palette;

    return { backgroundColor: palette.text.primary, color: palette.background.default };
  };

const shapePaint = (placed: KkPlacedBar): CSSObject => ({
  gridColumn: `${placed.column + 1} / span ${placed.span}`,
  gridRow: `${placed.lane + LANE_ROW_OFFSET}`,
  alignSelf: 'start',
  zIndex: 1,
  height: `calc(100% - ${monthBoard.laneGap})`,
  minWidth: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  marginLeft: placed.startsEarlier ? SQUARE : monthBoard.barInset,
  marginRight: placed.endsLater ? SQUARE : monthBoard.barInset,
  borderTopLeftRadius: placed.startsEarlier ? SQUARE : ROUNDED,
  borderBottomLeftRadius: placed.startsEarlier ? SQUARE : ROUNDED,
  borderTopRightRadius: placed.endsLater ? SQUARE : ROUNDED,
  borderBottomRightRadius: placed.endsLater ? SQUARE : ROUNDED,
  animation: placed.bar.running ? motion.breath : 'none',
});

interface KkMonthBoardBarProps {
  placed: KkPlacedBar;
  titled: boolean;
}

export const KkMonthBoardBar: FC<KkMonthBoardBarProps> = ({ placed, titled }) => {
  const time =
    placed.bar.time === null || placed.startsEarlier ? null : (
      <Box component="span" sx={{ fontWeight: 500, mr: 0.5 }}>
        {placed.bar.time}
      </Box>
    );

  return (
    <Box
      aria-hidden
      data-kk-month-board-bar={placed.bar.id}
      sx={[shapePaint(placed), fillPaint(placed)]}
    >
      <Typography
        variant="caption"
        noWrap
        sx={{
          display: 'block',
          px: 0.5,
          fontWeight: 700,
          lineHeight: monthBoard.bar,
          color: 'inherit',
          opacity: titled ? 1 : 0,
          transition: `opacity ${monthBoard.openSeconds}s ease-out`,
        }}
      >
        {time}
        {placed.bar.title}
      </Typography>
    </Box>
  );
};
