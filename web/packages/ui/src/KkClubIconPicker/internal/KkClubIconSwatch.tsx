import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { KkClubIcon } from '../../internal/club-icon';
import { focusRing } from '../../internal/focus-ring';
import { KkClubIconGlyph } from '../../KkClubIconGlyph';
import { KkIcon } from '../../KkIcon';
import { kkTokens } from '../../tokens';

const GLYPH_EXTENT = { width: '55%', height: '55%' } as const;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const swatchFace =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    width: kkTokens.tapTarget,
    height: kkTokens.tapTarget,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    appearance: 'none',
    cursor: 'pointer',
    padding: 0,
    borderRadius: `${kkTokens.radius.base}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: selected ? palette(theme).text.primary : palette(theme).divider,
    backgroundColor: selected ? palette(theme).text.primary : 'transparent',
    color: selected ? palette(theme).background.paper : palette(theme).text.primary,
    ...focusRing(theme),
  });

interface KkClubIconSwatchProps {
  icon: KkClubIcon | null;
  label: string;
  selected: boolean;
  onPick: (icon: KkClubIcon | null) => void;
}

export const KkClubIconSwatch: FC<KkClubIconSwatchProps> = ({ icon, label, selected, onPick }) => {
  const face = swatchFace(selected);
  const mark =
    icon === null ? (
      <KkIcon name="subtract" size="small" />
    ) : (
      <KkClubIconGlyph icon={icon} sx={GLYPH_EXTENT} />
    );

  const pick = (): void => {
    onPick(icon);
  };

  return (
    <Stack
      component="button"
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={pick}
      data-kk-club-icon-swatch={icon ?? 'none'}
      sx={face}
    >
      {mark}
    </Stack>
  );
};
