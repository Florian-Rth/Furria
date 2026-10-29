import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { kkTokens } from '../../tokens';
import type { KkStudioBDotRole } from '../studio-b-dot';

export const STAGE_TURN = 'transform 720ms cubic-bezier(0.65, 0, 0.35, 1)';

const ownPulse = keyframes`
  0% { transform: scale(1); opacity: 0.55; }
  70% { transform: scale(2.1); opacity: 0; }
  100% { transform: scale(2.1); opacity: 0; }
`;

type StagePalette = NonNullable<Theme['vars']>['palette'] | Theme['palette'];

const palette = (theme: Theme): StagePalette => (theme.vars ?? theme).palette;

const ROLE_PAINT: Record<KkStudioBDotRole, (theme: Theme) => CSSObject> = {
  own: (theme) => ({
    backgroundColor: palette(theme).primary.main,
    color: palette(theme).primary.contrastText,
    borderColor: palette(theme).primary.main,
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      backgroundColor: palette(theme).primary.main,
      animation: `${ownPulse} 1.6s ease-out infinite`,
      zIndex: -1,
      '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0 },
    },
  }),
  open: (theme) => ({
    backgroundColor: palette(theme).background.paper,
    color: palette(theme).text.secondary,
    borderColor: palette(theme).warning.main,
    borderStyle: 'dashed',
  }),
  cast: (theme) => ({
    backgroundColor: palette(theme).background.paper,
    color: palette(theme).text.primary,
    borderColor: palette(theme).text.primary,
  }),
};

export const discPaint =
  (role: KkStudioBDotRole) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    inset: 0,
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    typography: 'caption',
    fontWeight: 800,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    isolation: 'isolate',
    ...ROLE_PAINT[role](theme),
  });

export const notchPaint =
  (role: KkStudioBDotRole) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    inset: 0,
    '&::after': {
      content: '""',
      position: 'absolute',
      left: '50%',
      bottom: '-28%',
      width: '28%',
      height: '28%',
      transform: 'translateX(-50%)',
      clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
      backgroundColor: role === 'own' ? palette(theme).primary.main : palette(theme).text.primary,
    },
  });
