import type { CSSObject, Theme } from '@mui/material/styles';

export interface KkScheme {
  light: CSSObject;
  dark: CSSObject;
}

export const schemeInk = (light: string, dark: string): KkScheme => ({
  light: { color: light },
  dark: { color: dark },
});

export const schemeFill = (light: string, dark: string): KkScheme => ({
  light: { backgroundColor: light },
  dark: { backgroundColor: dark },
});

export const schemeEdge = (light: string, dark: string): KkScheme => ({
  light: { borderColor: light },
  dark: { borderColor: dark },
});

export const applyScheme = (theme: Theme, ...schemes: readonly KkScheme[]): CSSObject => {
  const light: CSSObject = {};
  const dark: CSSObject = {};

  for (const scheme of schemes) {
    Object.assign(light, scheme.light);
    Object.assign(dark, scheme.dark);
  }

  return { ...light, ...theme.applyStyles('dark', dark) };
};
