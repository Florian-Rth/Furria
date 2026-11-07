import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { inkFocusRing } from './internal/ink-focus-ring';
import type { KkLaneGlyphName } from './KkLaneGlyph';
import { KkLaneGlyph } from './KkLaneGlyph';
import { kkTokens } from './tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkMenuItemProps {
  text: string;
  glyph: KkLaneGlyphName;
  aside: string | null;
  onPress: () => void;
}

export const KkMenuItem: FC<KkMenuItemProps> = ({ text, glyph, aside, onPress }) => {
  const asideText =
    aside === null ? null : (
      <Typography
        component="span"
        variant="body2"
        sx={{ color: 'text.secondary', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
      >
        {aside}
      </Typography>
    );

  return (
    <ButtonBase
      onClick={onPress}
      sx={(theme) => ({
        minHeight: kkTokens.tapTarget,
        justifyContent: 'flex-start',
        gap: 1.25,
        px: 1.25,
        borderRadius: `${kkTokens.radius.base}px`,
        color: palette(theme).text.primary,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
        ...inkFocusRing(theme),
      })}
    >
      <KkLaneGlyph name={glyph} />
      <Typography
        component="span"
        variant="body2"
        sx={{ flex: 1, textAlign: 'left', fontWeight: 800 }}
      >
        {text}
      </Typography>
      {asideText}
      <KkLaneGlyph name="right" />
    </ButtonBase>
  );
};
