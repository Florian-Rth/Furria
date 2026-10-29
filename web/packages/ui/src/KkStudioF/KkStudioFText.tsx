import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { lineClamp } from '../internal/line-clamp';
import { kkTokens } from '../tokens';
import { textArrivalOf } from './internal/logic/studio-f-motion';
import type { KkStudioFTurn } from './studio-f-types';

const TEXT_LINES = 2;
const LINE_HEIGHT = 1.45;

const boxHeightOf = (theme: Theme): string =>
  `calc(${TEXT_LINES * LINE_HEIGHT} * ${theme.typography.body2.fontSize})`;

const boxPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  width: '100%',
  height: boxHeightOf(theme),
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: 0.5,
  textAlign: 'left',
  borderRadius: `${kkTokens.radius.bar}px`,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: `calc((${kkTokens.tapTarget} - ${boxHeightOf(theme)}) / -2) 0`,
  },
  ...focusRing(theme),
});

const textPaint =
  (quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    flex: 1,
    typography: 'body2',
    lineHeight: LINE_HEIGHT,
    color: quiet
      ? (theme.vars ?? theme).palette.text.secondary
      : (theme.vars ?? theme).palette.text.primary,
    ...lineClamp(TEXT_LINES),
  });

interface KkStudioFTextProps {
  text: string | null;
  emptyText: string;
  openLabel: string;
  turn: KkStudioFTurn;
  onOpen: () => void;
}

export const KkStudioFText: FC<KkStudioFTextProps> = ({
  text,
  emptyText,
  openLabel,
  turn,
  onOpen,
}) => {
  const arrival = { animation: textArrivalOf(turn.direction) };
  const body =
    text === null ? (
      <Box key={turn.key} component="span" sx={[textPaint(true), arrival]}>
        {emptyText}
      </Box>
    ) : (
      <ButtonBase key={turn.key} aria-label={openLabel} onClick={onOpen} sx={[boxPaint, arrival]}>
        <Box component="span" sx={textPaint(false)}>
          {text}
        </Box>
        <ChevronRightRoundedIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.125 }} />
      </ButtonBase>
    );

  return (
    <Box
      data-kk-studio-f-text
      sx={(theme) => ({ position: 'relative', height: boxHeightOf(theme), minWidth: 0 })}
    >
      {body}
    </Box>
  );
};
