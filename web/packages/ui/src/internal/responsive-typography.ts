import type { CSSObject, Theme } from '@mui/material/styles';

export type KkTypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline';

export interface KkResponsiveTypography {
  xs: KkTypographyVariant;
  desktop: KkTypographyVariant;
}

export const responsiveTypography = (
  theme: Theme,
  variants: KkResponsiveTypography,
  look: CSSObject,
): CSSObject => ({
  ...theme.typography[variants.xs],
  ...look,
  [theme.breakpoints.up('desktop')]: { ...theme.typography[variants.desktop], ...look },
});
