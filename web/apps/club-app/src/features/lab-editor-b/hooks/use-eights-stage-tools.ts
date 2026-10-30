import type { KkEightsGlyphName } from '@furria/ui/KkEightsGlyph';
import {
  EIGHTS_ADD_SPOT,
  EIGHTS_ALIGN_COLUMN,
  EIGHTS_ALIGN_ROW,
  EIGHTS_BLOCK,
  EIGHTS_CIRCLE,
  EIGHTS_COPY,
  EIGHTS_FORMATION,
  EIGHTS_LINE,
  EIGHTS_MIRROR,
  EIGHTS_MOVES,
  EIGHTS_MULTI,
  EIGHTS_ONION,
  EIGHTS_SPREAD,
} from '../eights-copy';
import type { EightsStudio } from './use-eights-studio';

export interface EightsChip {
  key: string;
  glyph: KkEightsGlyphName;
  text: string;
  pressed: boolean | null;
  disabled: boolean;
  press: () => void;
}

export interface EightsStageTools {
  modes: EightsChip[];
  chips: EightsChip[];
  inert: EightsChip[];
  moving: boolean;
}

export const useEightsStageTools = (eights: EightsStudio): EightsStageTools => {
  const { editor, screen } = eights;
  const { mode, evening, playback, practice } = screen;
  const stepIndex = playback.steps.findIndex((step) => step.stepId === practice.step?.stepId);
  const canPlace = mode.editing && practice.step !== null;
  const chip = (
    key: string,
    glyph: KkEightsGlyphName,
    text: string,
    press: () => void,
    enabled: boolean,
    pressed: boolean | null = null,
  ): EightsChip => ({ key, glyph, text, pressed, disabled: !enabled, press });

  const toFormation = (): void => {
    mode.choose('formation');
  };
  const toMoves = (): void => {
    mode.choose('movement');
  };
  const shared = [
    chip('multi', 'multi', EIGHTS_MULTI, editor.toggleMulti, mode.editing, editor.multi),
    chip('onion', 'onion', EIGHTS_ONION, editor.toggleOnion, mode.editing, editor.onion),
  ];
  const formation = [
    chip('line', 'line', EIGHTS_LINE, () => editor.preset('line'), canPlace),
    chip('block', 'block', EIGHTS_BLOCK, () => editor.preset('block'), canPlace),
    chip('circle', 'circle', EIGHTS_CIRCLE, () => editor.preset('circle'), canPlace),
    chip('copy', 'copy', EIGHTS_COPY, editor.copy, canPlace && stepIndex > 0),
    chip('mirror', 'mirror', EIGHTS_MIRROR, editor.mirror, canPlace && editor.canMirror),
    chip(
      'row',
      'alignRow',
      EIGHTS_ALIGN_ROW,
      () => editor.align('across'),
      canPlace && editor.canAlign,
    ),
    chip(
      'column',
      'alignColumn',
      EIGHTS_ALIGN_COLUMN,
      () => editor.align('deep'),
      canPlace && editor.canAlign,
    ),
    chip(
      'spread',
      'spread',
      EIGHTS_SPREAD,
      () => editor.distribute('across'),
      canPlace && editor.canDistribute,
    ),
    ...shared,
    chip('spot', 'addSpot', EIGHTS_ADD_SPOT, editor.addSpot, mode.editing && evening === null),
  ];

  const modes = [
    chip('formation', 'formation', EIGHTS_FORMATION, toFormation, true, editor.formation),
    chip('moves', 'ways', EIGHTS_MOVES, toMoves, true, editor.moving),
  ];
  const chips = editor.moving ? shared : formation;

  return {
    moving: editor.moving,
    modes,
    chips,
    inert: [...modes, ...chips].map((entry) => ({ ...entry, disabled: true })),
  };
};
