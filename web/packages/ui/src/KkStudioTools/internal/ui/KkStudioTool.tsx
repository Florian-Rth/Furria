import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { kkTokens } from '../../../tokens';
import type { KkStudioToolGlyph } from './studio-glyphs';
import { STUDIO_GLYPHS } from './studio-glyphs';

const WIDE = '@container kk-studio-h (min-aspect-ratio: 5/4)';
const WIDE_LOW = '@container kk-studio-h (min-aspect-ratio: 5/4) and (max-height: 30rem)';
const MARK_SPRING = { type: 'spring', stiffness: 520, damping: 42 } as const;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const toolPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flex: 1,
    minWidth: 0,
    flexDirection: 'column',
    gap: 0.125,
    py: 0.5,
    borderRadius: `${kkTokens.radius.base - 2}px`,
    color: palette(theme).text.secondary,
    transition: kkTokens.motion.press,
    '&:active': { transform: 'scale(0.94)' },
    ...(selected ? redInk(theme) : {}),
    ...focusRing(theme),
    [WIDE]: { flex: 'none', width: '5.25rem', height: '3.75rem' },
    [WIDE_LOW]: { height: '2.75rem', '& [data-kk-studio-tool-label]': { display: 'none' } },
  });

interface KkStudioToolProps {
  glyph: KkStudioToolGlyph;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

export const KkStudioTool: FC<KkStudioToolProps> = ({ glyph, label, selected, onSelect }) => {
  const mark = selected ? (
    <Box
      component={motion.span}
      layoutId="kk-studio-tool-mark"
      transition={MARK_SPRING}
      aria-hidden
      sx={(theme) => ({
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 12%, transparent)`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px color-mix(in srgb, ${palette(theme).primary.main} 45%, transparent)`,
      })}
    />
  ) : null;

  return (
    <ButtonBase
      role="tab"
      aria-label={label}
      aria-selected={selected}
      onClick={onSelect}
      data-kk-studio-tool={glyph}
      sx={toolPaint(selected)}
    >
      {mark}
      <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
        {STUDIO_GLYPHS[glyph]}
      </Box>
      <Typography
        component="span"
        variant="caption"
        data-kk-studio-tool-label
        sx={{
          position: 'relative',
          lineHeight: 1.1,
          fontWeight: selected ? 900 : 700,
          whiteSpace: 'nowrap',
          color: 'inherit',
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
};
