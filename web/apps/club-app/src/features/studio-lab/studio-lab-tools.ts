import type { KkChoiceChip } from '@furria/ui/KkChoiceChips';
import type { StudioLabSearch, StudioLabVariants } from './schemas';
import {
  StudioLabGlideSchema,
  StudioLabLiftSchema,
  StudioLabPrecisionSchema,
  StudioLabSelectionSchema,
} from './schemas';
import type { StudioLabPlayground } from './studio-lab';
import {
  GLIDE_CHOICES,
  GLIDE_LABEL,
  LIFT_CHOICES,
  LIFT_LABEL,
  PRECISION_CHOICES,
  PRECISION_LABEL,
  SELECTION_CHOICES,
  SELECTION_LABEL,
} from './studio-lab-copy';

export type StudioLabToolKey = 'lift' | 'precision' | 'selection' | 'glide';

export interface StudioLabTool {
  key: StudioLabToolKey;
  label: string;
  choices: readonly KkChoiceChip[];
  value: string;
  onChange: (id: string) => void;
}

const TOOLS_BY_PLAYGROUND: Record<StudioLabPlayground, readonly StudioLabToolKey[]> = {
  timeline: ['lift', 'precision'],
  stage: ['lift', 'selection', 'precision'],
  lists: [],
  rail: ['glide'],
};

export const studioLabToolKeysOf = (playground: StudioLabPlayground): readonly StudioLabToolKey[] =>
  TOOLS_BY_PLAYGROUND[playground];

const patchOf = (key: StudioLabToolKey, id: string): Partial<StudioLabSearch> | null => {
  switch (key) {
    case 'lift': {
      const parsed = StudioLabLiftSchema.safeParse(id);
      return parsed.success ? { lift: parsed.data } : null;
    }
    case 'precision': {
      const parsed = StudioLabPrecisionSchema.safeParse(id);
      return parsed.success ? { precision: parsed.data } : null;
    }
    case 'selection': {
      const parsed = StudioLabSelectionSchema.safeParse(id);
      return parsed.success ? { selection: parsed.data } : null;
    }
    case 'glide': {
      const parsed = StudioLabGlideSchema.safeParse(id);
      return parsed.success ? { glide: parsed.data } : null;
    }
  }
};

const TOOL_TEXTS: Record<StudioLabToolKey, { label: string; choices: readonly KkChoiceChip[] }> = {
  lift: { label: LIFT_LABEL, choices: LIFT_CHOICES },
  precision: { label: PRECISION_LABEL, choices: PRECISION_CHOICES },
  selection: { label: SELECTION_LABEL, choices: SELECTION_CHOICES },
  glide: { label: GLIDE_LABEL, choices: GLIDE_CHOICES },
};

export const studioLabToolsOf = (
  playground: StudioLabPlayground,
  variants: StudioLabVariants,
  choose: (patch: Partial<StudioLabSearch>) => void,
): StudioLabTool[] =>
  studioLabToolKeysOf(playground).map((key) => ({
    key,
    ...TOOL_TEXTS[key],
    value: variants[key],
    onChange: (id) => {
      const patch = patchOf(key, id);
      if (patch !== null) {
        choose(patch);
      }
    },
  }));
