import type { DeskInspectorAction } from '@furria/studio/use-desk-inspector';
import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';

interface DeskActionRowProps {
  label: string;
  actions: readonly DeskInspectorAction[];
}

export const DeskActionRow: FC<DeskActionRowProps> = ({ label, actions }) => {
  const buttons = actions.map((action) => (
    <KkLaneButton
      key={action.key}
      text={action.text}
      glyph={action.glyph}
      tone={action.tone}
      label={action.label}
      disabled={action.disabled}
      onPress={action.press}
    />
  ));

  return <KkLaneInspector.Actions label={label}>{buttons}</KkLaneInspector.Actions>;
};
