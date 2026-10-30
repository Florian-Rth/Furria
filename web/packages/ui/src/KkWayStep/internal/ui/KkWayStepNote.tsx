import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { lineClamp } from '../../../internal/line-clamp';
import { KkPracticeFade } from '../../../KkPracticeText/internal/ui/KkPracticeFade';
import { WAY_WIDE } from '../../../KkWayView/internal/logic/way-view-query';
import { kkTokens } from '../../../tokens';

const LINE = '1.3rem';
const LINES = 2;
const WIDE_LINES = 3;

const heightOf = (lines: number): string => `max(${kkTokens.tapTarget}, calc(${LINE} * ${lines}))`;

const notePaint = (theme: Theme): CSSObject => ({
  width: '100%',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  textAlign: 'left',
  gap: 0.5,
  height: heightOf(LINES),
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  [WAY_WIDE]: { height: heightOf(WIDE_LINES) },
  ...focusRing(theme),
});

interface KkWayStepNoteProps {
  stepKey: string;
  text: string;
  muted: boolean;
  label: string;
  onOpen: () => void;
}

export const KkWayStepNote: FC<KkWayStepNoteProps> = ({ stepKey, text, muted, label, onOpen }) => (
  <ButtonBase aria-label={label} onClick={onOpen} data-kk-way-note sx={notePaint}>
    <KkPracticeFade fadeKey={stepKey} sx={{ flex: 1, alignSelf: 'stretch' }}>
      <Typography
        variant="body2"
        component="span"
        sx={{
          ...lineClamp(LINES),
          lineHeight: LINE,
          color: muted ? 'text.disabled' : 'text.secondary',
          [WAY_WIDE]: { WebkitLineClamp: WIDE_LINES },
        }}
      >
        {text}
      </Typography>
    </KkPracticeFade>
    <Stack
      aria-hidden
      sx={{
        flexShrink: 0,
        width: '1.5rem',
        height: LINE,
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.secondary',
      }}
    >
      <ChevronRightRoundedIcon fontSize="small" />
    </Stack>
  </ButtonBase>
);
