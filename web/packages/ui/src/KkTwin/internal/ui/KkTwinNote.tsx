import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';
import { KkTwinFade } from './KkTwinFade';

const NOTE_CONTAINER = 'kk-twin-note';
const LINE_REM = 1.25;
const FEWEST_LINES = 1;
const MOST_LINES = 12;

const fittedLines: CSSObject = Object.fromEntries(
  Array.from({ length: MOST_LINES - FEWEST_LINES }, (_, index) => {
    const lines = index + FEWEST_LINES + 1;
    return [
      `@container ${NOTE_CONTAINER} (min-height: ${lines * LINE_REM}rem)`,
      { WebkitLineClamp: lines },
    ];
  }),
);

interface KkTwinNoteProps {
  stepKey: string;
  text: string;
  onOpen: (() => void) | null;
}

export const KkTwinNote: FC<KkTwinNoteProps> = ({ stepKey, text, onOpen }) => {
  const readable = onOpen !== null;
  const open = (): void => {
    onOpen?.();
  };

  return (
    <ButtonBase
      aria-haspopup={readable ? 'dialog' : undefined}
      disabled={!readable}
      onClick={open}
      data-kk-twin-note
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'start',
        justifyItems: 'stretch',
        width: '100%',
        height: '100%',
        minHeight: kkTokens.tapTarget,
        textAlign: 'start',
        borderRadius: `${kkTokens.radius.bar * 2}px`,
        color: (theme.vars ?? theme).palette.text.secondary,
        ...focusRing(theme),
      })}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          containerType: 'size',
          containerName: NOTE_CONTAINER,
        }}
      >
        <KkTwinFade fadeKey={stepKey}>
          <Typography
            variant="body2"
            data-kk-twin-description
            sx={{
              alignSelf: 'start',
              lineHeight: `${LINE_REM}rem`,
              textWrap: 'pretty',
              color: readable ? 'text.primary' : 'text.secondary',
              ...lineClamp(FEWEST_LINES),
              ...fittedLines,
            }}
          >
            {text}
          </Typography>
        </KkTwinFade>
      </Box>
      <ChevronRightRoundedIcon
        aria-hidden
        fontSize="small"
        sx={{ visibility: readable ? 'visible' : 'hidden' }}
      />
    </ButtonBase>
  );
};
