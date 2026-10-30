import type { KkLaneGlyphName } from '@furria/ui/KkLaneGlyph';
import {
  STEP_TOOL_ADD_SPOT,
  STEP_TOOL_ADD_SPOT_LABEL,
  STEP_TOOL_ALIGN,
  STEP_TOOL_ALIGN_DEEP,
  STEP_TOOL_BLOCK,
  STEP_TOOL_CIRCLE,
  STEP_TOOL_COPY,
  STEP_TOOL_DISTRIBUTE,
  STEP_TOOL_FORMATION,
  STEP_TOOL_LINE,
  STEP_TOOL_MIRROR,
  STEP_TOOL_MOVEMENT,
  STEP_TOOL_MULTI,
  STEP_TOOL_ONION,
  STEP_TOOL_SPOTS,
  STEP_TOOL_SPOTS_LABEL,
} from '../step-cards-copy';
import type { FormationPreset } from '../studio-formation';
import type { ActStudioStage } from './use-act-studio-stage';
import type { StudioScreen } from './use-studio-screen';

export interface StepCardTool {
  key: string;
  text: string;
  glyph: KkLaneGlyphName | undefined;
  label: string | undefined;
  pressed: boolean | undefined;
  disabled: boolean;
  press: () => void;
}

interface ToolOptions {
  label?: string;
  pressed?: boolean;
  disabled?: boolean;
}

const toolOf = (
  key: string,
  text: string,
  glyph: KkLaneGlyphName | undefined,
  press: () => void,
  options: ToolOptions = {},
): StepCardTool => ({
  key,
  text,
  glyph,
  label: options.label,
  pressed: options.pressed,
  disabled: options.disabled ?? false,
  press,
});

const arrangeToolsOf = (editor: ActStudioStage): StepCardTool[] => {
  const preset =
    (kind: FormationPreset): (() => void) =>
    (): void => {
      editor.preset(kind);
    };
  const alignAcross = (): void => {
    editor.align('across');
  };
  const alignDeep = (): void => {
    editor.align('deep');
  };
  const distribute = (): void => {
    editor.distribute('across');
  };

  return [
    toolOf('line', STEP_TOOL_LINE, 'line', preset('line')),
    toolOf('circle', STEP_TOOL_CIRCLE, 'circle', preset('circle')),
    toolOf('block', STEP_TOOL_BLOCK, 'block', preset('block')),
    toolOf('mirror', STEP_TOOL_MIRROR, 'mirror', editor.mirror, { disabled: !editor.canMirror }),
    toolOf('align', STEP_TOOL_ALIGN, 'alignAcross', alignAcross, { disabled: !editor.canAlign }),
    toolOf('alignDeep', STEP_TOOL_ALIGN_DEEP, 'alignDeep', alignDeep, {
      disabled: !editor.canAlign,
    }),
    toolOf('distribute', STEP_TOOL_DISTRIBUTE, 'distribute', distribute, {
      disabled: !editor.canDistribute,
    }),
    toolOf('copy', STEP_TOOL_COPY, 'copy', editor.copy, {
      disabled: editor.previousSeconds === null,
    }),
  ];
};

export const useStepCardTools = (screen: StudioScreen, editor: ActStudioStage): StepCardTool[] => {
  const { mode } = screen;
  const formation = (): void => {
    mode.choose('formation');
  };
  const movement = (): void => {
    mode.choose('movement');
  };
  const onFormation = mode.tool === 'formation';
  const onMovement = mode.tool === 'movement';
  const arranging = onFormation ? arrangeToolsOf(editor) : [];
  const onion = onMovement
    ? [toolOf('onion', STEP_TOOL_ONION, 'history', editor.toggleOnion, { pressed: editor.onion })]
    : [];

  return [
    toolOf('formation', STEP_TOOL_FORMATION, 'formation', formation, { pressed: onFormation }),
    toolOf('movement', STEP_TOOL_MOVEMENT, 'paths', movement, { pressed: onMovement }),
    toolOf('spots', STEP_TOOL_SPOTS, 'spots', editor.openSheet, { label: STEP_TOOL_SPOTS_LABEL }),
    ...arranging,
    ...onion,
    toolOf('multi', STEP_TOOL_MULTI, undefined, editor.toggleMulti, { pressed: editor.multi }),
    toolOf('add', STEP_TOOL_ADD_SPOT, 'add', editor.addSpot, { label: STEP_TOOL_ADD_SPOT_LABEL }),
  ];
};
