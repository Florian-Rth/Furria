import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkChromeMaterial } from './chrome-density';
import { chromeMaterialAt } from './chrome-density';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeEdge, schemeFill } from './scheme-paint';

const { material } = kkTokens.shell;

const chromeShadow = (chrome: KkChromeMaterial, ink: string, opacity: number): string =>
  `0 ${chrome.shadowOffsetY}px ${chrome.shadowBlur}px ${alpha(ink, opacity)}`;

const chromeShadowScheme = (chrome: KkChromeMaterial): KkScheme => ({
  light: { boxShadow: chromeShadow(chrome, material.shadowInk.light, chrome.light.shadow) },
  dark: { boxShadow: chromeShadow(chrome, material.shadowInk.dark, chrome.dark.shadow) },
});

const chromeTintScheme = (chrome: KkChromeMaterial): KkScheme =>
  schemeFill(
    alpha(kkTokens.color.light.bg, chrome.light.tint),
    alpha(kkTokens.color.dark.bg, chrome.dark.tint),
  );

const chromeHairlineScheme = (chrome: KkChromeMaterial): KkScheme =>
  schemeEdge(
    alpha(kkTokens.color.light.ink, chrome.light.hairline),
    alpha(kkTokens.color.dark.ink, chrome.dark.hairline),
  );

const chromePaint = (theme: Theme, chrome: KkChromeMaterial): CSSObject => ({
  minWidth: 0,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderRadius: `${kkTokens.radius.base}px`,
  backdropFilter: `blur(${chrome.blurRadius}px)`,
  WebkitBackdropFilter: `blur(${chrome.blurRadius}px)`,
  ...applyScheme(
    theme,
    chromeTintScheme(chrome),
    chromeHairlineScheme(chrome),
    chromeShadowScheme(chrome),
  ),
});

interface KkChromeProps extends PropsWithChildren {
  density: number;
  component?: ElementType;
  sx?: KkSx;
}

export const KkChrome: FC<KkChromeProps> = ({ density, component = 'div', sx, children }) => {
  const chrome = chromeMaterialAt(density);

  return (
    <Stack
      component={component}
      data-kk-chrome
      sx={[(theme) => chromePaint(theme, chrome), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Stack>
  );
};
