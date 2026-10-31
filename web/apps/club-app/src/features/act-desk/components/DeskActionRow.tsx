import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import type { DeskInspectorAction } from '../hooks/use-desk-inspector';

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
