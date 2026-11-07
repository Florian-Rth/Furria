import type { KkTimelineLaneKind } from '@furria/ui/KkTimeline';
import type { EjAction } from '@/features/lab-edit-jobs/edit-jobs-view';
import type { SetupPlace } from './setup-stages';

export interface SetupTool {
  key: string;
  text: string;
  label: string | null;
  press: () => void;
}

export interface SetupTask {
  sentence: string;
  tools: SetupTool[];
  more: SetupTool[];
}

export const toolOf = (
  key: string,
  text: string,
  press: () => void,
  label: string | null = null,
): SetupTool => ({ key, text, label, press });

export const toolsOfActions = (actions: readonly EjAction[]): SetupTool[] =>
  actions
    .filter((action) => !action.disabled)
    .map((action) => toolOf(action.key, action.text, action.press, action.label ?? null));

const WORKING_LANES: Record<SetupPlace, KkTimelineLaneKind | null> = {
  video: 'videos',
  borders: 'steps',
  names: 'steps',
  finish: null,
};

export const workingLaneOf = (place: SetupPlace): KkTimelineLaneKind | null => WORKING_LANES[place];
