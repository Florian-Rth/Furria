import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { useCurrentInLessonRail } from '../logic/use-current-in-lesson-rail';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const edgeOf = (theme: Theme, current: boolean, looped: boolean): string => {
  if (current || looped) {
    return `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).primary.main}`;
  }

  return `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`;
};

const stepPaint =
  (current: boolean, looped: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    gap: theme.spacing(0.75),
    height: kkTokens.tapTarget,
    minWidth: kkTokens.tapTarget,
    paddingInline: theme.spacing(1.25),
    borderRadius: `${kkTokens.radius.bar * 3}px`,
    overflow: 'clip',
    justifyContent: 'flex-start',
    WebkitTouchCallout: 'none',
    color: current ? palette(theme).text.primary : palette(theme).text.secondary,
    backgroundColor: looped
      ? `color-mix(in srgb, ${palette(theme).primary.main} 14%, ${palette(theme).background.paper})`
      : palette(theme).background.paper,
    boxShadow: `${edgeOf(theme, current, looped)}, ${kkTokens.shadow.rest}`,
    transition: 'box-shadow 200ms ease-out, color 200ms ease-out, background-color 200ms ease-out',
    '&:active': { transform: 'scale(0.96)' },
    ...focusRing(theme),
  });

interface KkLessonRailStepProps extends PropsWithChildren {
  number: number;
  name: string;
  label: string;
  current: boolean;
  looped: boolean;
  onPress: () => void;
}

export const KkLessonRailStep: FC<KkLessonRailStepProps> = ({
  number,
  name,
  label,
  current,
  looped,
  onPress,
  children,
}) => {
  const tile = useCurrentInLessonRail(current);
  const place = current ? 'step' : undefined;

  return (
    <ButtonBase
      ref={tile}
      aria-label={label}
      aria-current={place}
      onClick={onPress}
      data-kk-lesson-rail-step
      data-current={current}
      sx={stepPaint(current, looped)}
    >
      <Typography
        component="span"
        variant="h4"
        aria-hidden
        sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums', color: 'inherit' }}
      >
        {number}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        aria-hidden
        noWrap
        sx={{ maxWidth: '7rem', fontWeight: 800, lineHeight: 1.2, color: 'inherit' }}
      >
        {name}
      </Typography>
      {children}
    </ButtonBase>
  );
};
