import type { CSSProperties, PaletteOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import { redInk } from './internal/red-ink';
import type { KkColorTokens } from './tokens';
import { kkTokens } from './tokens';

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    desktop: true;
  }

  interface TypographyVariants {
    poster: CSSProperties;
    display: CSSProperties;
  }

  interface TypographyVariantsOptions {
    poster?: CSSProperties;
    display?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    poster: true;
    display: true;
    h5: false;
    h6: false;
  }
}

export const KK_DESKTOP_BREAKPOINT = 900;

const fontSize = {
  meta: '0.75rem',
  body: '0.875rem',
  lead: '1rem',
  section: '1.25rem',
  stat: '1.5rem',
  pageTitle: '2rem',
  hero: '3rem',
  heroWide: '4.5rem',
  poster: '4rem',
  posterWide: '6.5rem',
} as const;

const onDesktop = `@media (min-width:${KK_DESKTOP_BREAKPOINT}px)`;

const buildPalette = (color: KkColorTokens): PaletteOptions => ({
  primary: { main: color.red, dark: color.redDk, contrastText: color.onRed },
  error: { main: color.redDk, dark: color.redDk, contrastText: color.onRedDk },
  warning: { main: color.gold },
  success: { main: color.green },
  info: { main: color.blue },
  text: { primary: color.ink, secondary: color.sub, disabled: color.faint },
  background: { default: color.bg, paper: color.panel },
  divider: color.line,
});

const displayHeading = {
  fontFamily: kkTokens.font.display,
  fontWeight: kkTokens.font.displayWeight,
  letterSpacing: kkTokens.type.tracking.tight,
} as const;

export const KK_DARK_SCHEME_ATTRIBUTE = 'data-dark';

export const kkTheme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: { palette: buildPalette(kkTokens.color.light) },
    dark: { palette: buildPalette(kkTokens.color.dark) },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      desktop: KK_DESKTOP_BREAKPOINT,
      lg: 1200,
      xl: 1536,
    },
  },
  shape: { borderRadius: kkTokens.radius.base },
  typography: {
    fontFamily: kkTokens.font.body,
    fontWeightLight: 500,
    fontWeightRegular: 500,
    fontWeightMedium: 700,
    fontWeightBold: 800,
    poster: {
      ...displayHeading,
      fontSize: fontSize.poster,
      lineHeight: 0.95,
      [onDesktop]: { fontSize: fontSize.posterWide },
    },
    display: {
      ...displayHeading,
      fontSize: fontSize.hero,
      lineHeight: 0.95,
      [onDesktop]: { fontSize: fontSize.heroWide },
    },
    h1: { ...displayHeading, fontSize: fontSize.pageTitle, lineHeight: 1.05 },
    h2: { ...displayHeading, fontSize: fontSize.stat, lineHeight: 1.1 },
    h3: { ...displayHeading, fontSize: fontSize.section, lineHeight: 1.15 },
    h4: { ...displayHeading, fontSize: fontSize.lead, lineHeight: 1.2 },
    h5: undefined,
    h6: undefined,
    subtitle1: { fontSize: fontSize.lead, fontWeight: 600, lineHeight: 1.45 },
    subtitle2: { fontSize: fontSize.body, fontWeight: 700, lineHeight: 1.45 },
    body1: { fontSize: fontSize.lead, lineHeight: 1.5 },
    body2: { fontSize: fontSize.body, lineHeight: 1.45 },
    caption: { fontSize: fontSize.meta, lineHeight: 1.4 },
    overline: { fontSize: fontSize.meta, lineHeight: 1.4 },
    button: { fontSize: fontSize.body, fontWeight: 800, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          WebkitTapHighlightColor: 'transparent',
        },
        '#root': {
          overflowX: 'clip',
        },
        'a, button, label, summary, [role="button"], [role="tab"], [role="option"]': {
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        },
        '@keyframes kk-skeleton-shimmer': {
          from: { backgroundPosition: '100% 0' },
          to: { backgroundPosition: '-100% 0' },
        },
        '@keyframes kk-breath': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
        '@keyframes kk-screen-arrival': {
          from: {
            opacity: 0,
            transform: `translateY(${kkTokens.shell.screen.arrivalRise}px)`,
          },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '@keyframes kk-row-highlight': {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
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
          borderRadius: kkTokens.radius.pill,
          fontWeight: 800,
        },
        sizeSmall: { fontSize: fontSize.meta },
        sizeMedium: { fontSize: fontSize.body },
        sizeLarge: { fontSize: fontSize.body },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
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
          fontSize: fontSize.meta,
          fontWeight: 800,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { fontSize: fontSize.meta },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: kkTokens.radius.base,
          backgroundColor: (theme.vars ?? theme).palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1.5,
            borderColor: (theme.vars ?? theme).palette.divider,
          },
          '@media (hover: hover)': {
            '&:hover:not(.Mui-error, .Mui-disabled) .MuiOutlinedInput-notchedOutline': {
              borderColor: (theme.vars ?? theme).palette.text.secondary,
            },
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1.5,
            borderColor: (theme.vars ?? theme).palette.primary.main,
          },
        }),
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 700,
          '&.Mui-focused': redInk(theme),
        }),
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: kkTokens.radius.base,
          fontWeight: 600,
        },
        standard: ({ theme }) => ({
          border: `1.5px solid ${(theme.vars ?? theme).palette.divider}`,
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: kkTokens.radius.base,
        },
      },
    },
  },
});
