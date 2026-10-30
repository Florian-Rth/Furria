import { KkLaneButton } from '@furria/ui/KkLaneButton';
import { KkLaneInspector } from '@furria/ui/KkLaneInspector';
import type { FC } from 'react';
import type { LaneInspectorAction } from '../hooks/use-lane-inspector';

interface LaneActionRowProps {
  label: string;
  actions: readonly LaneInspectorAction[];
}

export const LaneActionRow: FC<LaneActionRowProps> = ({ label, actions }) => {
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
