import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren, Ref } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkChromeInkOpacity, KkChromeMaterial } from './chrome-density';
import { chromeMaterialAt } from './chrome-density';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeEdge, schemeFill } from './scheme-paint';

const { material } = kkTokens.shell;

const chromeShadow = (chrome: KkChromeMaterial, ink: string, opacity: number): string =>
  `0 ${chrome.shadowOffsetY}px ${chrome.shadowBlur}px ${alpha(ink, opacity)}`;

const chromeGlint = (ink: KkChromeInkOpacity): string =>
  `inset 0 ${kkTokens.line.hair}px 0 ${alpha(material.glint, ink.glint)}, inset 0 0 0 ${kkTokens.line.hair}px ${alpha(material.glint, ink.rim)}`;

const chromeSheen = (opacity: number): string =>
  `linear-gradient(180deg, ${alpha(material.glint, opacity)}, ${alpha(material.glint, 0)})`;

const chromeShadowScheme = (chrome: KkChromeMaterial): KkScheme => ({
  light: {
    boxShadow: `${chromeGlint(chrome.light)}, ${chromeShadow(chrome, material.shadowInk.light, chrome.light.shadow)}`,
  },
  dark: {
    boxShadow: `${chromeGlint(chrome.dark)}, ${chromeShadow(chrome, material.shadowInk.dark, chrome.dark.shadow)}`,
  },
});

const chromeSheenScheme = (chrome: KkChromeMaterial): KkScheme => ({
  light: { backgroundImage: chromeSheen(chrome.light.sheen) },
  dark: { backgroundImage: chromeSheen(chrome.dark.sheen) },
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

const chromeBackdrop = (chrome: KkChromeMaterial): string =>
  `blur(${chrome.blurRadius}px) saturate(${chrome.saturation})`;

const chromePaint = (theme: Theme, chrome: KkChromeMaterial): CSSObject => ({
  minWidth: 0,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderRadius: `${kkTokens.radius.base}px`,
  backdropFilter: chromeBackdrop(chrome),
  WebkitBackdropFilter: chromeBackdrop(chrome),
  ...applyScheme(
    theme,
    chromeTintScheme(chrome),
    chromeSheenScheme(chrome),
    chromeHairlineScheme(chrome),
    chromeShadowScheme(chrome),
  ),
});

interface KkChromeProps extends PropsWithChildren {
  density: number;
  component?: ElementType;
  ref?: Ref<HTMLDivElement>;
  sx?: KkSx;
}

export const KkChrome: FC<KkChromeProps> = ({ density, component = 'div', ref, sx, children }) => {
  const chrome = chromeMaterialAt(density);

  return (
    <Stack
      ref={ref}
      component={component}
      data-kk-chrome
      sx={[(theme) => chromePaint(theme, chrome), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Stack>
  );
};
