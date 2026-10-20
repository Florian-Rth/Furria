import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkGroupTone } from '../../internal/group-tone';
import { groupToneRecipes } from '../../internal/group-tone';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';
import type { KkCalendarHoursBadge } from './logic/calendar-hours-types';

const { calendarHours, color, chrome } = kkTokens;

export const HOURS_COLUMNS = {
  xs: `${calendarHours.dayColumn.xs} minmax(0, 1fr)`,
  md: `${calendarHours.dayColumn.md} minmax(0, 1fr)`,
};

export const HOURS_HALO = '--kk-calendar-hours-halo';

const mix = (source: string, amount: string): string =>
  `color-mix(in srgb, ${source} ${amount}, transparent)`;

const layer = (wash: string): string => `linear-gradient(${wash}, ${wash})`;

export const hoursFillPaint = (
  theme: Theme,
  tone: KkGroupTone | null,
  selected: boolean,
): CSSObject => {
  const wash = selected ? calendarHours.selectedWash : calendarHours.fillWash;
  const paper = (theme.vars ?? theme).palette.background.paper;

  if (tone === null) {
    const ink = (theme.vars ?? theme).palette.text.primary;

    return {
      backgroundColor: paper,
      borderColor: ink,
      backgroundImage: layer(mix(ink, wash.light)),
      ...theme.applyStyles('dark', { backgroundImage: layer(mix(ink, wash.dark)) }),
    };
  }

  const recipe = groupToneRecipes[tone];

  return {
    backgroundColor: paper,
    ...applyScheme(
      theme,
      {
        light: { backgroundImage: layer(mix(recipe.fieldLight, wash.light)) },
        dark: { backgroundImage: layer(mix(recipe.fieldDark, wash.dark)) },
      },
      schemeEdge(recipe.edgeLight, recipe.edgeDark),
    ),
  };
};

export const hoursToneInk = (theme: Theme, tone: KkGroupTone | null): CSSObject =>
  tone === null
    ? { color: 'text.primary' }
    : applyScheme(
        theme,
        schemeInk(groupToneRecipes[tone].inkLight, groupToneRecipes[tone].inkDark),
      );

const BADGE_SCHEMES: Record<Exclude<KkCalendarHoursBadge, null>, (theme: Theme) => CSSObject> = {
  yes: (theme) =>
    applyScheme(
      theme,
      schemeFill(color.light.green, color.dark.green),
      schemeInk(color.light.onRed, color.dark.ink),
      schemeEdge(color.light.green, color.dark.green),
    ),
  maybe: (theme) =>
    applyScheme(
      theme,
      schemeFill(color.light.panel2, color.dark.panel2),
      schemeInk(color.light.goldInk, color.dark.goldInk),
      schemeEdge(color.light.gold, color.dark.gold),
    ),
  no: (theme) =>
    applyScheme(
      theme,
      schemeFill(color.light.panel2, color.dark.panel2),
      schemeInk(color.light.sub, color.dark.sub),
      schemeEdge(color.light.faint, color.dark.faint),
    ),
  owed: (theme) =>
    applyScheme(
      theme,
      schemeFill(color.light.gold, color.dark.gold),
      schemeInk(color.light.onyx, color.dark.onyx),
      schemeEdge(color.light.gold, color.dark.gold),
    ),
};

export const hoursBadgePaint = (
  theme: Theme,
  badge: Exclude<KkCalendarHoursBadge, null>,
): CSSObject => BADGE_SCHEMES[badge](theme);

export const hoursCarnivalWash = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeFill(chrome.light.glowGold, chrome.dark.glowGold));

const TODAY_WASH = { light: '4%', dark: '5%' } as const;

export const hoursTodayWash = (theme: Theme): CSSObject => {
  const accent = (theme.vars ?? theme).palette.primary.main;

  return applyScheme(
    theme,
    schemeFill(mix(accent, TODAY_WASH.light), mix(accent, TODAY_WASH.dark)),
  );
};

export const hoursGoldInk = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(color.light.goldInk, color.dark.goldInk));

export const hoursHalo = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  const halo = (amount: string): string =>
    `color-mix(in srgb, ${palette.primary.main} ${amount}, ${palette.background.paper})`;

  return {
    [HOURS_HALO]: halo(TODAY_WASH.light),
    ...theme.applyStyles('dark', { [HOURS_HALO]: halo(TODAY_WASH.dark) }),
  };
};

export const HALO_TEXT: CSSObject = {
  backgroundColor: `var(${HOURS_HALO}, transparent)`,
  borderRadius: '3px',
  px: '2px',
};
