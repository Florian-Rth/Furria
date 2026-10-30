import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioInlineText } from '@furria/ui/KkStudioInlineText';
import type { FC } from 'react';
import type { StudioScreen } from '../hooks/use-studio-screen';
import {
  STUDIO_NAME_LABEL,
  STUDIO_NAME_PLACEHOLDER,
  STUDIO_NOTE_LABEL,
  STUDIO_NOTE_PLACEHOLDER,
} from '../studio-copy';

interface ActStudioStepTextsProps {
  screen: StudioScreen;
}

export const ActStudioStepTexts: FC<ActStudioStepTextsProps> = ({ screen }) => {
  const step = screen.practice.step;
  const name = step?.name ?? '';
  const description = step?.description ?? '';
  const rename = (value: string): void => {
    if (step !== null) {
      screen.edits.setText(step.stepId, { name: value, description });
    }
  };
  const describe = (value: string): void => {
    if (step !== null) {
      screen.edits.setText(step.stepId, { name, description: value });
    }
  };

  return (
    <KkPracticeView.Titles>
      <KkStudioInlineText
        variant="name"
        value={name}
        label={STUDIO_NAME_LABEL}
        placeholder={STUDIO_NAME_PLACEHOLDER}
        onChange={rename}
      />
      <KkStudioInlineText
        variant="note"
        value={description}
        label={STUDIO_NOTE_LABEL}
        placeholder={STUDIO_NOTE_PLACEHOLDER}
        onChange={describe}
      />
    </KkPracticeView.Titles>
  );
};
