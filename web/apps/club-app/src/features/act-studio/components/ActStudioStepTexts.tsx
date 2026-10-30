import { KkPracticeView } from '@furria/ui/KkPracticeView';
import { KkStudioInlineText } from '@furria/ui/KkStudioInlineText';
import type { FC } from 'react';
import { useStepTexts } from '../hooks/use-step-texts';
import type { StudioScreen } from '../hooks/use-studio-screen';
import {
  STUDIO_NAME_LABEL,
  STUDIO_NAME_PLACEHOLDER,
  STUDIO_NOTE_LABEL,
  STUDIO_NOTE_PLACEHOLDER,
  STUDIO_STEP_NAME_LENGTH,
  STUDIO_STEP_NOTE_LENGTH,
} from '../studio-copy';

interface ActStudioStepTextsProps {
  screen: StudioScreen;
}

export const ActStudioStepTexts: FC<ActStudioStepTextsProps> = ({ screen }) => {
  const texts = useStepTexts(screen);

  return (
    <KkPracticeView.Titles>
      <KkStudioInlineText
        variant="name"
        value={texts.name}
        label={STUDIO_NAME_LABEL}
        placeholder={STUDIO_NAME_PLACEHOLDER}
        maxLength={STUDIO_STEP_NAME_LENGTH}
        onChange={texts.rename}
        onCommit={texts.commit}
      />
      <KkStudioInlineText
        variant="note"
        value={texts.description}
        label={STUDIO_NOTE_LABEL}
        placeholder={STUDIO_NOTE_PLACEHOLDER}
        maxLength={STUDIO_STEP_NOTE_LENGTH}
        onChange={texts.describe}
        onCommit={texts.commit}
      />
    </KkPracticeView.Titles>
  );
};
