import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { kkTokens } from '../../../tokens';
import {
  prefersStillMotion,
  SHEET_HEAD,
  SHEET_ROW,
  SHEET_SCROLLER,
  SHEET_TEMPLATE,
} from '../logic/sheet-metrics';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;
const PERCENT = 100;

interface KkEightsSheetCursorProps {
  row: number;
  column: number;
  columns: number;
  following: boolean;
}

const keepInView = (node: HTMLElement, row: number, following: boolean): void => {
  const scroller = node.closest<HTMLElement>(SHEET_SCROLLER);
  const target = scroller?.querySelector<HTMLElement>(`[data-row-index="${row}"]`);

  if (scroller === null || scroller === undefined || target === null || target === undefined) {
    return;
  }

  const top = target.offsetTop;
  const bottom = top + target.offsetHeight;
  const outside = top < scroller.scrollTop || bottom > scroller.scrollTop + scroller.clientHeight;

  if (following || outside) {
    scroller.scrollTo({
      top: top - (scroller.clientHeight - target.offsetHeight) / 2,
      behavior: prefersStillMotion() ? 'auto' : 'smooth',
    });
  }
};

export const KkEightsSheetCursor: FC<KkEightsSheetCursorProps> = ({
  row,
  column,
  columns,
  following,
}) => {
  const node = useRef<HTMLDivElement>(null);
  const cell = Math.min(columns - 1, Math.floor(column));
  const place = { top: `calc(${SHEET_HEAD} + ${row} * ${SHEET_ROW})` };
  const lit = { left: `${(cell / columns) * PERCENT}%`, width: `${PERCENT / columns}%` };
  const line = { left: `${(column / columns) * PERCENT}%` };

  useEffect(() => {
    if (node.current !== null) {
      keepInView(node.current, row, following);
    }
  }, [row, following]);

  return (
    <Box
      ref={node}
      aria-hidden
      data-kk-eights-cursor
      style={place}
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        height: SHEET_ROW,
        display: 'grid',
        gridTemplateColumns: SHEET_TEMPLATE,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <Box
        sx={(theme) => ({
          gridColumn: '1 / -1',
          gridRow: 1,
          backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 5%, transparent)`,
          boxShadow: `inset ${kkTokens.line.page}px 0 0 ${palette(theme).primary.main}`,
        })}
      />
      <Box sx={{ gridColumn: 3, gridRow: 1, position: 'relative' }}>
        <Box
          style={lit}
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            bottom: 0,
            backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 22%, transparent)`,
            boxShadow: `inset 0 -${kkTokens.line.page}px 0 ${palette(theme).primary.main}`,
          })}
        />
        <Box
          style={line}
          sx={(theme) => ({
            position: 'absolute',
            top: '-0.25rem',
            bottom: '-0.25rem',
            width: kkTokens.line.section,
            transform: 'translateX(-50%)',
            borderRadius: `${kkTokens.radius.bar}px`,
            backgroundColor: palette(theme).primary.main,
          })}
        />
      </Box>
    </Box>
  );
};
