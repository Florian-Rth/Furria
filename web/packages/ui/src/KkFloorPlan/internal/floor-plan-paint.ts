import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

export type KkPlanAreaKind =
  | 'stage'
  | 'bar'
  | 'technics'
  | 'wardrobe'
  | 'toilets'
  | 'kitchen'
  | 'other';

export type KkPlanDoorKind = 'entrance' | 'emergencyExit' | 'door';

export type KkPlanSeverity = 'conflict' | 'hint';

export type KkPlanTableShape = 'rectangle' | 'round';

export interface KkPlanSides {
  front: boolean;
  back: boolean;
  start: boolean;
  end: boolean;
}

export const PLAN_HIT_ATTRIBUTE = 'data-kk-plan-id';
export const PLAN_HANDLE_ATTRIBUTE = 'data-kk-plan-handle';

const CHIP_CHARACTER_PX = 7;
const CHIP_PADDING_PX = 12;
const MUTED_OPACITY = 0.45;

export const PLAN_CHIP_HEIGHT_PX = 20;
export const PLAN_HANDLE_PX = 10;
export const PLAN_ROTATE_REACH_PX = 26;
export const PLAN_NOTE_MARK_PX = 7;

export const planPalette = (theme: Theme) => (theme.vars ?? theme).palette;

export const planTint = (color: string, amount: string): string =>
  `color-mix(in srgb, ${color} ${amount}, transparent)`;

const areaSources: Record<KkPlanAreaKind, (theme: Theme) => string> = {
  stage: (theme) => planPalette(theme).primary.main,
  bar: (theme) => planPalette(theme).warning.main,
  technics: (theme) => planPalette(theme).info.main,
  wardrobe: (theme) => planPalette(theme).text.secondary,
  toilets: (theme) => planPalette(theme).info.main,
  kitchen: (theme) => planPalette(theme).warning.main,
  other: (theme) => planPalette(theme).text.disabled,
};

export const areaInk = (theme: Theme, kind: KkPlanAreaKind): string => areaSources[kind](theme);

const doorSources: Record<KkPlanDoorKind, (theme: Theme) => string> = {
  entrance: (theme) => planPalette(theme).info.main,
  emergencyExit: (theme) => planPalette(theme).success.main,
  door: (theme) => planPalette(theme).text.secondary,
};

export const doorInk = (theme: Theme, kind: KkPlanDoorKind): string => doorSources[kind](theme);

export const severityInk = (theme: Theme, severity: KkPlanSeverity): string =>
  severity === 'conflict' ? planPalette(theme).primary.main : planPalette(theme).warning.main;

export const severityTextFill = (theme: Theme, severity: KkPlanSeverity): CSSObject =>
  severity === 'conflict'
    ? { fill: planPalette(theme).primary.main }
    : {
        fill: kkTokens.color.light.goldInk,
        ...theme.applyStyles('dark', { fill: kkTokens.color.dark.goldInk }),
      };

export const mutedPaint = (muted: boolean): CSSObject =>
  muted ? { opacity: MUTED_OPACITY, pointerEvents: 'none' } : {};

export const hitAttributes = (
  id: string | undefined,
  muted: boolean,
): Record<string, string | undefined> => ({
  [PLAN_HIT_ATTRIBUTE]: muted ? undefined : id,
});

export const placeAt = (x: number, y: number, rotation: number): string =>
  `translate(${x} ${y}) rotate(${rotation})`;

export const screenConstantAt = (x: number, y: number, scale: number): string =>
  `translate(${x} ${y}) scale(${1 / scale})`;

export const chipWidthPx = (label: string): number =>
  label.length * CHIP_CHARACTER_PX + CHIP_PADDING_PX;

export const pointsAttribute = (points: readonly { x: number; y: number }[]): string =>
  points.map((point) => `${point.x},${point.y}`).join(' ');

export const NON_SCALING = 'non-scaling-stroke';

export const STROKE = {
  hair: kkTokens.line.hair,
  section: kkTokens.line.section,
  page: kkTokens.line.page,
} as const;
