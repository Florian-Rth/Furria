import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from './scheme-paint';
import type { KkContrastFloor, KkOklch } from './tone-color';
import { isToneHex, oklchOf, shadeForContrast, TONE_HEX_PATTERN, toneDistance } from './tone-color';

export type KkGroupTone = string;

export const GROUP_TONE_PRESETS = [
  '#A0522B',
  '#676C1D',
  '#43741F',
  '#207823',
  '#1F7565',
  '#3F5FCC',
  '#6E50D1',
  '#9C35C8',
  '#B12F9C',
  '#BA3264',
] as const;

export const KK_TONE_PATTERN = TONE_HEX_PATTERN;

export interface KkGroupToneRecipe {
  fieldLight: string;
  fieldDark: string;
  inkLight: string;
  inkDark: string;
  edgeLight: string;
  edgeDark: string;
}

export const GROUP_TONE_ON_FIELD_LIGHT = '#FFFFFF';
export const GROUP_TONE_ON_FIELD_DARK = '#F4F6F8';

const presetRecipes: Record<(typeof GROUP_TONE_PRESETS)[number], KkGroupToneRecipe> = {
  '#A0522B': {
    fieldLight: '#A0522B',
    fieldDark: '#995938',
    inkLight: '#A95125',
    inkDark: '#CD8662',
    edgeLight: '#A0522B',
    edgeDark: '#BF6436',
  },
  '#676C1D': {
    fieldLight: '#676C1D',
    fieldDark: '#696E29',
    inkLight: '#6A6F18',
    inkDark: '#969E32',
    edgeLight: '#676C1D',
    edgeDark: '#7B8225',
  },
  '#43741F': {
    fieldLight: '#43741F',
    fieldDark: '#4B752B',
    inkLight: '#42771A',
    inkDark: '#67A735',
    edgeLight: '#43741F',
    edgeDark: '#528A27',
  },
  '#207823': {
    fieldLight: '#207823',
    fieldDark: '#2D782F',
    inkLight: '#1B7A1E',
    inkDark: '#36AD3A',
    edgeLight: '#207823',
    edgeDark: '#28902C',
  },
  '#1F7565': {
    fieldLight: '#1F7565',
    fieldDark: '#2B7567',
    inkLight: '#1A7766',
    inkDark: '#35A993',
    edgeLight: '#1F7565',
    edgeDark: '#278C79',
  },
  '#3F5FCC': {
    fieldLight: '#3F5FCC',
    fieldDark: '#4964BC',
    inkLight: '#3E61D5',
    inkDark: '#8094D7',
    edgeLight: '#3F5FCC',
    edgeDark: '#5C77D1',
  },
  '#6E50D1': {
    fieldLight: '#6E50D1',
    fieldDark: '#7057C1',
    inkLight: '#7152D9',
    inkDark: '#9E8BDB',
    edgeLight: '#6E50D1',
    edgeDark: '#846CD5',
  },
  '#9C35C8': {
    fieldLight: '#9C35C8',
    fieldDark: '#9644B9',
    inkLight: '#A231D2',
    inkDark: '#BD80D7',
    edgeLight: '#9C35C8',
    edgeDark: '#AC58D0',
  },
  '#B12F9C': {
    fieldLight: '#B12F9C',
    fieldDark: '#A93F97',
    inkLight: '#B929A1',
    inkDark: '#D477C4',
    edgeLight: '#B12F9C',
    edgeDark: '#CB45B4',
  },
  '#BA3264': {
    fieldLight: '#BA3264',
    fieldDark: '#B1416A',
    inkLight: '#C42B63',
    inkDark: '#D57C9C',
    edgeLight: '#BA3264',
    edgeDark: '#CD4F7E',
  },
};

const LIGHT_PAGE = '#F1F2F4';
const DARK_PANEL = '#1F232A';
const TEXT_RATIO = 4.6;
const EDGE_RATIO = 3.2;
const DARK_FIELD_CHROMA = 0.88;
const TAKEN_DISTANCE = 0.025;

const floorOf = (
  against: string,
  ratio: number,
  direction: KkContrastFloor['direction'],
): KkContrastFloor => ({ against, ratio, direction });

const deriveRecipe = (tone: KkGroupTone): KkGroupToneRecipe => {
  const picked: KkOklch = oklchOf(tone);
  const muted: KkOklch = { ...picked, c: picked.c * DARK_FIELD_CHROMA };
  const fieldLight = shadeForContrast(
    picked,
    floorOf(GROUP_TONE_ON_FIELD_LIGHT, TEXT_RATIO, 'darker'),
  );

  return {
    fieldLight,
    fieldDark: shadeForContrast(muted, floorOf(GROUP_TONE_ON_FIELD_DARK, TEXT_RATIO, 'darker')),
    inkLight: shadeForContrast(picked, floorOf(LIGHT_PAGE, TEXT_RATIO, 'darker')),
    inkDark: shadeForContrast(picked, floorOf(DARK_PANEL, TEXT_RATIO, 'lighter')),
    edgeLight: fieldLight,
    edgeDark: shadeForContrast(picked, floorOf(DARK_PANEL, EDGE_RATIO, 'lighter')),
  };
};

const derivedRecipes = new Map<KkGroupTone, KkGroupToneRecipe>();

export const isKkGroupTone = (value: string): value is KkGroupTone => isToneHex(value);

export const isGroupTonePreset = (tone: KkGroupTone): boolean =>
  (GROUP_TONE_PRESETS as readonly string[]).includes(tone.toUpperCase());

const presetRecipeOf = (tone: KkGroupTone): KkGroupToneRecipe | undefined =>
  Object.entries(presetRecipes).find(([preset]) => preset === tone.toUpperCase())?.[1];

export const groupToneRecipe = (tone: KkGroupTone): KkGroupToneRecipe => {
  const preset = presetRecipeOf(tone);
  if (preset !== undefined) {
    return preset;
  }

  const key = tone.toUpperCase();
  const known = derivedRecipes.get(key);
  if (known !== undefined) {
    return known;
  }

  const derived = deriveRecipe(key);
  derivedRecipes.set(key, derived);

  return derived;
};

export const areTonesAlike = (first: KkGroupTone, second: KkGroupTone): boolean =>
  toneDistance(first.toUpperCase(), second.toUpperCase()) < TAKEN_DISTANCE;

export const eventToneOf = (eventId: number): KkGroupTone =>
  GROUP_TONE_PRESETS[eventId % GROUP_TONE_PRESETS.length] ?? GROUP_TONE_PRESETS[0];

export const groupToneFieldScheme = (tone: KkGroupTone): KkScheme =>
  schemeFill(groupToneRecipe(tone).fieldLight, groupToneRecipe(tone).fieldDark);

export const groupToneOnFieldScheme = (): KkScheme =>
  schemeInk(GROUP_TONE_ON_FIELD_LIGHT, GROUP_TONE_ON_FIELD_DARK);

export const groupToneInkScheme = (tone: KkGroupTone): KkScheme =>
  schemeInk(groupToneRecipe(tone).inkLight, groupToneRecipe(tone).inkDark);

export const groupToneEdgeScheme = (tone: KkGroupTone): KkScheme =>
  schemeEdge(groupToneRecipe(tone).edgeLight, groupToneRecipe(tone).edgeDark);

export const groupToneFieldPaint = (theme: Theme, tone: KkGroupTone): CSSObject =>
  applyScheme(theme, groupToneOnFieldScheme(), groupToneFieldScheme(tone));

export const groupToneInkPaint = (theme: Theme, tone: KkGroupTone): CSSObject =>
  applyScheme(theme, groupToneInkScheme(tone));

export const isToneTaken = (tone: KkGroupTone, takenTones: Iterable<KkGroupTone>): boolean =>
  [...takenTones].some((taken) => areTonesAlike(taken, tone));
