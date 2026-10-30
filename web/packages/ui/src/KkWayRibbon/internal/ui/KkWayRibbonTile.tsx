import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { useCurrentInRail } from '../../../KkPracticeSegments/internal/logic/use-current-in-rail';
import { kkTokens } from '../../../tokens';
import { RIBBON_HEIGHT, TILE_MIN_WIDTH, tileWidthOf } from '../logic/ribbon-sizes';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const edgeOf = (theme: Theme, current: boolean, looped: boolean): string => {
  if (looped) {
    return `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`;
  }

  return current ? `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}` : 'none';
};

const tilePaint =
  (eights: number, current: boolean, looped: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: theme.spacing(0.5),
    width: tileWidthOf(eights),
    minWidth: TILE_MIN_WIDTH,
    height: RIBBON_HEIGHT,
    padding: theme.spacing(0.75, 0.75, 0.875),
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    textAlign: 'left',
    color: current ? palette(theme).text.primary : palette(theme).text.secondary,
    backgroundColor: looped
      ? `color-mix(in srgb, ${palette(theme).primary.main} 14%, ${palette(theme).background.paper})`
      : `color-mix(in srgb, ${palette(theme).text.primary} ${current ? 8 : 4}%, transparent)`,
    boxShadow: edgeOf(theme, current, looped),
    transition: 'background-color 200ms ease-out, box-shadow 200ms ease-out, color 200ms ease-out',
    '&:active': { transform: 'scale(0.97)' },
    ...focusRing(theme),
  });

interface KkWayRibbonTileProps extends PropsWithChildren {
  number: number;
  name: string;
  eights: number;
  label: string;
  current: boolean;
  looped: boolean;
  onPress: () => void;
}

export const KkWayRibbonTile: FC<KkWayRibbonTileProps> = ({
  number,
  name,
  eights,
  label,
  current,
  looped,
  onPress,
  children,
}) => {
  const tile = useCurrentInRail(current);

  return (
    <ButtonBase
      ref={tile}
      aria-label={label}
      aria-current={current ? 'step' : undefined}
      data-kk-way-tile
      data-looped={looped}
      onClick={onPress}
      sx={tilePaint(eights, current, looped)}
    >
      <Typography
        component="span"
        variant="caption"
        noWrap
        aria-hidden
        sx={{ display: 'block', fontWeight: 800, lineHeight: 1.2, color: 'inherit' }}
      >
        <Typography
          component="span"
          variant="caption"
          sx={{ fontWeight: 900, fontVariantNumeric: 'tabular-nums', mr: 0.5, opacity: 0.6 }}
        >
          {number}
        </Typography>
        {name}
      </Typography>
      {children}
    </ButtonBase>
  );
};
