import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioHInlineText } from '@furria/ui/KkStudioHInlineText';
import type { FC } from 'react';
import type { StudioH } from '../hooks/use-studio-h';
import {
  STUDIO_H_NAME_LABEL,
  STUDIO_H_NAME_PLACEHOLDER,
  STUDIO_H_NOTE_LABEL,
  STUDIO_H_NOTE_PLACEHOLDER,
} from '../studio-h-copy';

interface StudioHStepTextsProps {
  h: StudioH;
}

export const StudioHStepTexts: FC<StudioHStepTextsProps> = ({ h }) => {
  const step = h.practice.step;
  const name = step?.name ?? '';
  const description = step?.description ?? '';
  const rename = (value: string): void => {
    if (step !== null) {
      h.edits.setText(step.stepId, { name: value, description });
    }
  };
  const describe = (value: string): void => {
    if (step !== null) {
      h.edits.setText(step.stepId, { name, description: value });
    }
  };

  return (
    <KkPracticeView.Titles>
      <KkStudioHInlineText
        variant="name"
        value={name}
        label={STUDIO_H_NAME_LABEL}
        placeholder={STUDIO_H_NAME_PLACEHOLDER}
        onChange={rename}
      />
      <KkStudioHInlineText
        variant="note"
        value={description}
        label={STUDIO_H_NOTE_LABEL}
        placeholder={STUDIO_H_NOTE_PLACEHOLDER}
        onChange={describe}
      />
    </KkPracticeView.Titles>
  );
};
