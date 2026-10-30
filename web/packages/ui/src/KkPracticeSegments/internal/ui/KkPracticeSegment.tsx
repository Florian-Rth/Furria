import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { useCurrentInRail } from '../logic/use-current-in-rail';
import { usePressHold } from '../logic/use-press-hold';

const TILE = kkTokens.tapTarget;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const edgeOf = (theme: Theme, current: boolean, looped: boolean): string => {
  if (looped) {
    return `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`;
  }

  return current ? `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}` : 'none';
};

const tilePaint =
  (current: boolean, looped: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    flexBasis: TILE,
    minWidth: TILE,
    height: TILE,
    borderRadius: `${kkTokens.radius.bar * 2}px`,
    overflow: 'clip',
    WebkitTouchCallout: 'none',
    color: current ? palette(theme).text.primary : palette(theme).text.secondary,
    backgroundColor: looped
      ? `color-mix(in srgb, ${palette(theme).primary.main} 16%, ${palette(theme).background.paper})`
      : `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
    boxShadow: edgeOf(theme, current, looped),
    transition: 'background-color 200ms ease-out, box-shadow 200ms ease-out, color 200ms ease-out',
    ...focusRing(theme),
  });

interface KkPracticeSegmentProps extends PropsWithChildren {
  grow: number;
  number: number;
  label: string;
  current: boolean;
  looped: boolean;
  onPress: () => void;
  onHold: () => void;
}

export const KkPracticeSegment: FC<KkPracticeSegmentProps> = ({
  grow,
  number,
  label,
  current,
  looped,
  onPress,
  onHold,
  children,
}) => {
  const press = usePressHold(onPress, onHold);
  const tile = useCurrentInRail(current);

  return (
    <ButtonBase
      ref={tile}
      aria-label={label}
      aria-current={current ? 'step' : undefined}
      aria-pressed={looped}
      data-kk-practice-segment
      data-looped={looped}
      {...press}
      style={{ flexGrow: grow }}
      sx={tilePaint(current, looped)}
    >
      {children}
      <Typography
        component="span"
        variant="caption"
        aria-hidden
        sx={{
          position: 'relative',
          fontWeight: 800,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
          color: 'inherit',
        }}
      >
        {number}
      </Typography>
    </ButtonBase>
  );
};
