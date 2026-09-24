import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type { ElementType, FC, PropsWithChildren, Ref } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkChromeInkOpacity } from './chrome-density';
import { CHROME_DENSITY_PROPERTY, CHROME_MATERIAL } from './chrome-density';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeEdge, schemeFill } from './scheme-paint';

const { material } = kkTokens.shell;

const inkAt = (ink: string, opacity: string): string =>
  `color-mix(in srgb, ${ink} calc(${opacity} * 100%), transparent)`;

const pixels = (length: string): string => `calc(${length} * 1px)`;

const chromeShadow = (ink: string, opacity: string): string =>
  `0 ${pixels(CHROME_MATERIAL.shadowOffsetY)} ${pixels(CHROME_MATERIAL.shadowBlur)} ${inkAt(ink, opacity)}`;

const chromeGlint = (ink: KkChromeInkOpacity): string =>
  `inset 0 ${kkTokens.line.hair}px 0 ${inkAt(material.glint, ink.glint)}, inset 0 0 0 ${kkTokens.line.hair}px ${inkAt(material.glint, ink.rim)}`;

const chromeSheen = (opacity: string): string =>
  `linear-gradient(180deg, ${inkAt(material.glint, opacity)}, ${alpha(material.glint, 0)})`;

const CHROME_SHADOW: KkScheme = {
  light: {
    boxShadow: `${chromeGlint(CHROME_MATERIAL.light)}, ${chromeShadow(material.shadowInk.light, CHROME_MATERIAL.light.shadow)}`,
  },
  dark: {
    boxShadow: `${chromeGlint(CHROME_MATERIAL.dark)}, ${chromeShadow(material.shadowInk.dark, CHROME_MATERIAL.dark.shadow)}`,
  },
};

const CHROME_SHEEN: KkScheme = {
  light: { backgroundImage: chromeSheen(CHROME_MATERIAL.light.sheen) },
  dark: { backgroundImage: chromeSheen(CHROME_MATERIAL.dark.sheen) },
};

const CHROME_TINT: KkScheme = schemeFill(
  inkAt(kkTokens.color.light.bg, CHROME_MATERIAL.light.tint),
  inkAt(kkTokens.color.dark.bg, CHROME_MATERIAL.dark.tint),
);

const CHROME_HAIRLINE: KkScheme = schemeEdge(
  inkAt(kkTokens.color.light.ink, CHROME_MATERIAL.light.hairline),
  inkAt(kkTokens.color.dark.ink, CHROME_MATERIAL.dark.hairline),
);

const CHROME_BACKDROP = `blur(${pixels(CHROME_MATERIAL.blurRadius)}) saturate(${CHROME_MATERIAL.saturation})`;

const chromePaint = (theme: Theme): CSSObject => ({
  minWidth: 0,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderRadius: `${kkTokens.radius.base}px`,
  backdropFilter: CHROME_BACKDROP,
  WebkitBackdropFilter: CHROME_BACKDROP,
  ...applyScheme(theme, CHROME_TINT, CHROME_SHEEN, CHROME_HAIRLINE, CHROME_SHADOW),
});

const densityPaint = (density: number | undefined): CSSObject =>
  density === undefined ? {} : { [CHROME_DENSITY_PROPERTY]: density };

interface KkChromeProps extends PropsWithChildren {
  density?: number;
  component?: ElementType;
  ref?: Ref<HTMLDivElement>;
  sx?: KkSx;
}

export const KkChrome: FC<KkChromeProps> = ({ density, component = 'div', ref, sx, children }) => {
  const densityOverride = densityPaint(density);

  return (
    <Stack
      ref={ref}
      component={component}
      data-kk-chrome
      sx={[chromePaint, densityOverride, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Stack>
  );
};
