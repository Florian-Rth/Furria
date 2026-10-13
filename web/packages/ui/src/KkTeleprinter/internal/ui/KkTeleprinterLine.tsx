import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useId, useState } from 'react';
import { highlightMark, highlightPaint } from '../../../internal/highlight-paint';
import { inkWash } from '../../../internal/ink-wash';
import { KkChip } from '../../../KkChip';
import { kkTokens } from '../../../tokens';
import type { KkTeleprinterLevel } from '../teleprinter-paint';
import { levelTickPaint, quietButton } from '../teleprinter-paint';

const { system } = kkTokens;

const LINE_FRAME: CSSObject = {
  display: 'grid',
  gridTemplateColumns: `${system.logTick}px ${system.logTime} minmax(0, 1fr)`,
  columnGap: 1,
  alignItems: 'start',
  py: 0.625,
  minWidth: 0,
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: 'divider',
};

const exceptionPaint = (theme: Theme): CSSObject => ({
  ...theme.typography.caption,
  fontFamily: kkTokens.font.mono,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
  m: 0,
  mt: 0.5,
  p: 1,
  maxHeight: '18rem',
  overflowY: 'auto',
  borderRadius: `${kkTokens.radius.bar}px`,
  backgroundColor: inkWash(theme, '6%'),
});

interface KkTeleprinterLineProps extends PropsWithChildren {
  level: KkTeleprinterLevel;
  time: string;
  source: string;
  message: string;
  category?: string;
  exception: string | null;
  exceptionLabel: string;
  repeat?: string;
  highlight?: boolean;
}

export const KkTeleprinterLine: FC<KkTeleprinterLineProps> = ({
  level,
  time,
  source,
  message,
  category,
  exception,
  exceptionLabel,
  repeat,
  highlight = false,
  children,
}) => {
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [repeatsOpen, setRepeatsOpen] = useState(false);
  const exceptionId = useId();
  const highlightProps = highlightMark(highlight);
  const repeatsId = useId();

  const toggleException = (): void => {
    setExceptionOpen((open) => !open);
  };

  const toggleRepeats = (): void => {
    setRepeatsOpen((open) => !open);
  };

  const categoryLine =
    category === undefined ? null : (
      <Typography
        component="span"
        sx={{ typography: 'caption', color: 'text.disabled', overflowWrap: 'anywhere' }}
      >
        {category}
      </Typography>
    );
  const repeatToggle =
    repeat === undefined ? null : (
      <Box
        component="button"
        type="button"
        aria-expanded={repeatsOpen}
        aria-controls={repeatsId}
        onClick={toggleRepeats}
        sx={quietButton}
      >
        {repeat}
      </Box>
    );
  const exceptionToggle =
    exception === null ? null : (
      <Box
        component="button"
        type="button"
        aria-expanded={exceptionOpen}
        aria-controls={exceptionId}
        onClick={toggleException}
        sx={quietButton}
      >
        {exceptionLabel}
      </Box>
    );
  const exceptionBlock =
    exceptionOpen && exception !== null ? (
      <Box component="pre" id={exceptionId} sx={exceptionPaint}>
        {exception}
      </Box>
    ) : null;
  const repeats = repeatsOpen ? (
    <Stack component="ul" id={repeatsId} sx={{ m: 0, p: 0, pl: 1, listStyle: 'none', minWidth: 0 }}>
      {children}
    </Stack>
  ) : null;

  return (
    <Box
      component="li"
      {...highlightProps}
      data-kk-teleprinter-line={level}
      sx={[{ minWidth: 0 }, highlight && highlightPaint]}
    >
      <Box sx={LINE_FRAME}>
        <Box sx={[{ alignSelf: 'stretch', borderRadius: '1px' }, levelTickPaint(level)]} />
        <Typography
          component="span"
          sx={{
            typography: 'caption',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            pt: 0.25,
          }}
        >
          {time}
        </Typography>
        <Stack sx={{ minWidth: 0, rowGap: 0.25 }}>
          <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 0.75, minWidth: 0 }}>
            <KkChip size="small" sx={{ flexShrink: 0 }}>
              {source}
            </KkChip>
            <Typography
              component="span"
              sx={{
                typography: 'body2',
                fontWeight: 600,
                minWidth: 0,
                overflowWrap: 'anywhere',
              }}
            >
              {message}
            </Typography>
          </Stack>
          {categoryLine}
          <Stack direction="row" sx={{ columnGap: 1.5, flexWrap: 'wrap' }}>
            {repeatToggle}
            {exceptionToggle}
          </Stack>
          {exceptionBlock}
        </Stack>
      </Box>
      {repeats}
    </Box>
  );
};
