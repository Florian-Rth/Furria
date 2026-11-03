import { STEP_CARD_TOOLS } from '@furria/studio/step-cards-copy';
import type { StepCardTool } from '@furria/studio/use-step-card-tools';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneCards } from '@furria/ui/KkLaneCards';
import type { FC } from 'react';

interface StepCardToolsProps {
  tools: readonly StepCardTool[];
}

export const StepCardTools: FC<StepCardToolsProps> = ({ tools }) => {
  const buttons = tools.map((tool) => (
    <KkLaneButton
      key={tool.key}
      text={tool.text}
      glyph={tool.glyph}
      label={tool.label}
      pressed={tool.pressed}
      disabled={tool.disabled}
      onPress={tool.press}
    />
  ));

  return <KkLaneCards.Chips label={STEP_CARD_TOOLS}>{buttons}</KkLaneCards.Chips>;
};
