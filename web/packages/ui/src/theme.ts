import type { PaletteOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import type { KkColorTokens } from './tokens';
import { kkTokens } from './tokens';

const buildPalette = (color: KkColorTokens): PaletteOptions => ({
  primary: { main: color.red, dark: color.redDk, contrastText: color.onRed },
  error: { main: color.red, dark: color.redDk, contrastText: color.onRed },
  warning: { main: color.gold },
  success: { main: color.green },
  info: { main: color.blue },
  text: { primary: color.ink, secondary: color.sub, disabled: color.faint },
  background: { default: color.bg, paper: color.panel },
  divider: color.line,
});

const displayHeading = {
  fontFamily: kkTokens.font.display,
  fontWeight: 400,
  letterSpacing: '0.01em',
} as const;

/**
 * The ONE FURRIA theme (Corporate Identity) — shared by every app, no variants.
 * Light + dark via MUI CSS-vars color schemes; base radius 14 everywhere.
 */
export const kkTheme = createTheme({
  // The `data-light`/`data-dark` attribute selector (instead of the `media`
  // default) is what makes a manual light/dark toggle via useColorScheme()
  // possible — media queries cannot be overridden from JS.
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: { palette: buildPalette(kkTokens.color.light) },
    dark: { palette: buildPalette(kkTokens.color.dark) },
  },
  shape: { borderRadius: kkTokens.radius.base },
  typography: {
    fontFamily: kkTokens.font.body,
    fontWeightLight: 500,
    fontWeightRegular: 500,
    fontWeightMedium: 700,
    fontWeightBold: 800,
    h1: { ...displayHeading, fontSize: 'clamp(2.75rem, 6vw, 4.5rem)', lineHeight: 1.02 },
    h2: { ...displayHeading, fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', lineHeight: 1.05 },
    h3: { ...displayHeading, fontSize: '2.25rem', lineHeight: 1.1 },
    h4: { ...displayHeading, fontSize: '1.75rem', lineHeight: 1.15 },
    h5: { ...displayHeading, fontSize: '1.375rem', lineHeight: 1.2 },
    h6: { ...displayHeading, fontSize: '1.125rem', lineHeight: 1.25 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 700 },
    button: { fontWeight: 800, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Respect prefers-reduced-motion for every animation/transition,
        // including MUI's built-in ones (drawer slide, fades, ripple).
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          // Buttons are pills — signature gesture of the design language.
          borderRadius: kkTokens.radius.pill,
          fontWeight: 800,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          // Hairline border + soft resting shadow on every surface.
          border: `1.5px solid ${(theme.vars ?? theme).palette.divider}`,
          boxShadow: kkTokens.shadow.rest,
          backgroundImage: 'none',
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: kkTokens.radius.chip,
          fontWeight: 800,
        },
      },
    },
  },
});
