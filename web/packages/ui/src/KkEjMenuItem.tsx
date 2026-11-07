import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { ejFocusRing } from './internal/ej-focus-ring';
import type { KkEjGlyphName } from './KkEjGlyph';
import { KkEjGlyph } from './KkEjGlyph';
import { kkTokens } from './tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEjMenuItemProps {
  text: string;
  glyph: KkEjGlyphName;
  aside: string | null;
  onPress: () => void;
}

export const KkEjMenuItem: FC<KkEjMenuItemProps> = ({ text, glyph, aside, onPress }) => {
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
        ...ejFocusRing(theme),
      })}
    >
      <KkEjGlyph name={glyph} />
      <Typography
        component="span"
        variant="body2"
        sx={{ flex: 1, textAlign: 'left', fontWeight: 800 }}
      >
        {text}
      </Typography>
      {asideText}
      <KkEjGlyph name="next" />
    </ButtonBase>
  );
};
