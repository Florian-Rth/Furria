import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export type KkWayPipKeyGlyph = 'mirror' | 'take';

const GLYPHS: Record<KkWayPipKeyGlyph, ReactNode> = {
  mirror: <FlipRoundedIcon fontSize="small" />,
  take: <VideoLibraryRoundedIcon fontSize="small" />,
};

const keyPaint = (theme: Theme) => ({
  minWidth: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  display: 'grid',
  placeItems: 'center',
  borderRadius: `${kkTokens.radius.pill}px`,
  ...focusRing(theme),
});

const glassOf = (pressed: boolean): string =>
  `color-mix(in srgb, ${kkTokens.color.dark.darkroom} ${pressed ? 78 : 52}%, transparent)`;

interface KkWayPipKeyProps {
  glyph: KkWayPipKeyGlyph;
  text: string | null;
  label: string;
  pressed: boolean;
  onPress: () => void;
}

export const KkWayPipKey: FC<KkWayPipKeyProps> = ({ glyph, text, label, pressed, onPress }) => {
  const shownText =
    text === null ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{ fontWeight: 800, lineHeight: 1, color: 'inherit' }}
      >
        {text}
      </Typography>
    );

  return (
    <ButtonBase aria-label={label} aria-pressed={pressed} onClick={onPress} sx={keyPaint}>
      <Stack
        direction="row"
        component="span"
        sx={{
          alignItems: 'center',
          gap: 0.5,
          px: 0.875,
          height: '1.875rem',
          borderRadius: `${kkTokens.radius.pill}px`,
          backdropFilter: 'blur(6px)',
          backgroundColor: glassOf(pressed),
          color: kkTokens.color.dark.ink,
        }}
      >
        {GLYPHS[glyph]}
        {shownText}
      </Stack>
    </ButtonBase>
  );
};
