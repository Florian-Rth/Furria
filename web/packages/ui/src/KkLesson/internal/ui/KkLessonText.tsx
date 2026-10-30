import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';
import {
  LESSON_CRAMPED,
  LESSON_TALL,
  LESSON_WIDE,
  LESSON_WIDE_SHORT,
  LESSON_WIDE_TALL,
} from '../lesson-query';
import { KkLessonFade } from './KkLessonFade';

const LINE = '1.375rem';
const PORTRAIT_LINES = 3;
const TALL_LINES = 4;
const WIDE_LINES = 4;
const WIDE_SHORT_LINES = 2;
const WIDE_TALL_LINES = 8;
const CRAMPED_LINES = 2;

const boxOf = (lines: number): CSSObject => ({ height: `calc(${LINE} * ${lines})` });

const clampOf = (lines: number): CSSObject => ({ WebkitLineClamp: lines });

const textPaint = (theme: Theme): CSSObject => ({
  flex: 1,
  minWidth: 0,
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  textAlign: 'left',
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  ...focusRing(theme),
});

interface KkLessonTextProps {
  fadeKey: string;
  text: string;
  muted: boolean;
  onRead?: () => void;
}

export const KkLessonText: FC<KkLessonTextProps> = ({ fadeKey, text, muted, onRead }) => {
  const readable = onRead !== undefined;
  const lines = (
    <KkLessonFade
      fadeKey={fadeKey}
      silent={readable}
      sx={{
        flex: 1,
        ...boxOf(PORTRAIT_LINES),
        [LESSON_TALL]: boxOf(TALL_LINES),
        [LESSON_WIDE]: boxOf(WIDE_LINES),
        [LESSON_WIDE_SHORT]: boxOf(WIDE_SHORT_LINES),
        [LESSON_WIDE_TALL]: boxOf(WIDE_TALL_LINES),
        [LESSON_CRAMPED]: boxOf(CRAMPED_LINES),
      }}
    >
      <Typography
        component="span"
        variant="body1"
        sx={{
          ...lineClamp(PORTRAIT_LINES),
          lineHeight: LINE,
          color: muted ? 'text.secondary' : 'text.primary',
          [LESSON_TALL]: clampOf(TALL_LINES),
          [LESSON_WIDE]: clampOf(WIDE_LINES),
          [LESSON_WIDE_SHORT]: clampOf(WIDE_SHORT_LINES),
          [LESSON_WIDE_TALL]: clampOf(WIDE_TALL_LINES),
          [LESSON_CRAMPED]: clampOf(CRAMPED_LINES),
        }}
      >
        {text}
      </Typography>
    </KkLessonFade>
  );

  if (!readable) {
    return (
      <Stack direction="row" data-kk-lesson-text sx={textPaint}>
        {lines}
      </Stack>
    );
  }

  return (
    <ButtonBase
      aria-haspopup="dialog"
      aria-label={text}
      onClick={onRead}
      data-kk-lesson-text
      sx={textPaint}
    >
      {lines}
      <OpenInFullRoundedIcon
        aria-hidden
        fontSize="small"
        sx={{ flexShrink: 0, color: 'text.secondary', opacity: kkTokens.opacity.dimmed }}
      />
    </ButtonBase>
  );
};
