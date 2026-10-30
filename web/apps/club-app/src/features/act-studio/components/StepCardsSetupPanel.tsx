import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneDesk } from '@furria/ui/KkLaneDesk';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import type { StepCardsSetup } from '../hooks/use-step-cards-setup';
import { SETUP_LIST_LABEL, SETUP_TO_EDITOR } from '../setup-copy';
import { StudioSetupList } from './StudioSetupList';

interface StepCardsSetupPanelProps {
  cardsSetup: StepCardsSetup;
}

export const StepCardsSetupPanel: FC<StepCardsSetupPanelProps> = ({ cardsSetup }) => (
  <KkLaneDesk.Panel label={SETUP_LIST_LABEL} kind="region" fit>
    <KkLaneInspector>
      <StudioSetupList setup={cardsSetup.setup} />
      <KkLaneInspector.Actions label={SETUP_LIST_LABEL}>
        <KkLaneButton text={SETUP_TO_EDITOR} glyph="right" onPress={cardsSetup.close} />
      </KkLaneInspector.Actions>
    </KkLaneInspector>
  </KkLaneDesk.Panel>
);
