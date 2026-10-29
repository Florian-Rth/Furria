import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { usePressHold } from '../logic/use-press-hold';

const HIT = '2.75rem';
const BAR = '0.5rem';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const barPaint =
  (current: boolean, looped: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    width: '100%',
    height: BAR,
    borderRadius: `${kkTokens.radius.pill}px`,
    overflow: 'clip',
    backgroundColor: looped
      ? `color-mix(in srgb, ${palette(theme).primary.main} 28%, transparent)`
      : palette(theme).divider,
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: looped ? palette(theme).primary.main : 'transparent',
    outlineOffset: kkTokens.line.section,
    transform: current ? 'scaleY(1.5)' : 'none',
    transition:
      'transform 200ms ease-out, background-color 200ms ease-out, outline-color 200ms ease-out',
  });

interface KkPracticeSegmentProps extends PropsWithChildren {
  grow: number;
  label: string;
  current: boolean;
  looped: boolean;
  onPress: () => void;
  onHold: () => void;
}

export const KkPracticeSegment: FC<KkPracticeSegmentProps> = ({
  grow,
  label,
  current,
  looped,
  onPress,
  onHold,
  children,
}) => {
  const press = usePressHold(onPress, onHold);

  return (
    <ButtonBase
      aria-label={label}
      aria-current={current ? 'step' : undefined}
      data-kk-practice-segment
      data-looped={looped}
      {...press}
      style={{ flexGrow: grow }}
      sx={(theme) => ({
        position: 'relative',
        flexBasis: 0,
        minWidth: '0.5rem',
        height: HIT,
        alignItems: 'center',
        borderRadius: `${kkTokens.radius.bar}px`,
        WebkitTouchCallout: 'none',
        ...focusRing(theme),
      })}
    >
      <Box sx={barPaint(current, looped)}>{children}</Box>
    </ButtonBase>
  );
};
