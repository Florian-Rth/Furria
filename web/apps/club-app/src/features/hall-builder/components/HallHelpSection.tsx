import { KkNote } from '@furria/ui/KkNote';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { useHallBuilderContext } from '../hall-builder-context';
import { HELP_TITLE, KEY_HINT, TOOL_HINTS } from '../hall-builder-copy';

export const HallHelpSection: FC = () => {
  const { tool, isPhone } = useHallBuilderContext();
  const keys = isPhone ? null : <KkNote tone="muted">{KEY_HINT}</KkNote>;

  return (
    <KkPanelSection title={HELP_TITLE}>
      <KkNote tone="hint">{TOOL_HINTS[tool]}</KkNote>
      {keys}
    </KkPanelSection>
  );
};
