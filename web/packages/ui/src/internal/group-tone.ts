import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from './scheme-paint';

export const GROUP_TONES = [
  'clay',
  'olive',
  'lime',
  'fern',
  'teal',
  'indigo',
  'iris',
  'violet',
  'orchid',
  'rose',
] as const;

export type KkGroupTone = (typeof GROUP_TONES)[number];

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

export const groupToneRecipes: Record<KkGroupTone, KkGroupToneRecipe> = {
  clay: {
    fieldLight: '#A0522B',
    fieldDark: '#995938',
    inkLight: '#A95125',
    inkDark: '#CD8662',
    edgeLight: '#A0522B',
    edgeDark: '#BF6436',
  },
  olive: {
    fieldLight: '#676C1D',
    fieldDark: '#696E29',
    inkLight: '#6A6F18',
    inkDark: '#969E32',
    edgeLight: '#676C1D',
    edgeDark: '#7B8225',
  },
  lime: {
    fieldLight: '#43741F',
    fieldDark: '#4B752B',
    inkLight: '#42771A',
    inkDark: '#67A735',
    edgeLight: '#43741F',
    edgeDark: '#528A27',
  },
  fern: {
    fieldLight: '#207823',
    fieldDark: '#2D782F',
    inkLight: '#1B7A1E',
    inkDark: '#36AD3A',
    edgeLight: '#207823',
    edgeDark: '#28902C',
  },
  teal: {
    fieldLight: '#1F7565',
    fieldDark: '#2B7567',
    inkLight: '#1A7766',
    inkDark: '#35A993',
    edgeLight: '#1F7565',
    edgeDark: '#278C79',
  },
  indigo: {
    fieldLight: '#3F5FCC',
    fieldDark: '#4964BC',
    inkLight: '#3E61D5',
    inkDark: '#8094D7',
    edgeLight: '#3F5FCC',
    edgeDark: '#5C77D1',
  },
  iris: {
    fieldLight: '#6E50D1',
    fieldDark: '#7057C1',
    inkLight: '#7152D9',
    inkDark: '#9E8BDB',
    edgeLight: '#6E50D1',
    edgeDark: '#846CD5',
  },
  violet: {
    fieldLight: '#9C35C8',
    fieldDark: '#9644B9',
    inkLight: '#A231D2',
    inkDark: '#BD80D7',
    edgeLight: '#9C35C8',
    edgeDark: '#AC58D0',
  },
  orchid: {
    fieldLight: '#B12F9C',
    fieldDark: '#A93F97',
    inkLight: '#B929A1',
    inkDark: '#D477C4',
    edgeLight: '#B12F9C',
    edgeDark: '#CB45B4',
  },
  rose: {
    fieldLight: '#BA3264',
    fieldDark: '#B1416A',
    inkLight: '#C42B63',
    inkDark: '#D57C9C',
    edgeLight: '#BA3264',
    edgeDark: '#CD4F7E',
  },
};

export const isKkGroupTone = (value: string): value is KkGroupTone =>
  (GROUP_TONES as readonly string[]).includes(value);

export const groupToneFieldScheme = (tone: KkGroupTone): KkScheme =>
  schemeFill(groupToneRecipes[tone].fieldLight, groupToneRecipes[tone].fieldDark);

export const groupToneOnFieldScheme = (): KkScheme =>
  schemeInk(GROUP_TONE_ON_FIELD_LIGHT, GROUP_TONE_ON_FIELD_DARK);

export const groupToneInkScheme = (tone: KkGroupTone): KkScheme =>
  schemeInk(groupToneRecipes[tone].inkLight, groupToneRecipes[tone].inkDark);

export const groupToneEdgeScheme = (tone: KkGroupTone): KkScheme =>
  schemeEdge(groupToneRecipes[tone].edgeLight, groupToneRecipes[tone].edgeDark);

export const groupToneFieldPaint = (theme: Theme, tone: KkGroupTone): CSSObject =>
  applyScheme(theme, groupToneOnFieldScheme(), groupToneFieldScheme(tone));

export const groupToneInkPaint = (theme: Theme, tone: KkGroupTone): CSSObject =>
  applyScheme(theme, groupToneInkScheme(tone));
