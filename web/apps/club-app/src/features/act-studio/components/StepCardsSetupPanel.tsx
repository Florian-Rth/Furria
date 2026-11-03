import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_LIST_LABEL, SETUP_TO_EDITOR } from '@furria/studio/setup-copy';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import type { StepCardsSetup } from '../hooks/use-step-cards-setup';

interface StepCardsSetupPanelProps {
  cardsSetup: StepCardsSetup;
}

export const StepCardsSetupPanel: FC<StepCardsSetupPanelProps> = ({ cardsSetup }) => (
  <KkLaneDesk.Panel label={SETUP_LIST_LABEL} fit>
    <KkLaneInspector>
      <StudioSetupList setup={cardsSetup.setup} />
      <KkLaneInspector.Actions label={SETUP_LIST_LABEL}>
        <KkLaneButton text={SETUP_TO_EDITOR} glyph="right" onPress={cardsSetup.close} />
      </KkLaneInspector.Actions>
    </KkLaneInspector>
  </KkLaneDesk.Panel>
);
