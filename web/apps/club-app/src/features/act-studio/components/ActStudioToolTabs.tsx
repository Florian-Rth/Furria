import { KkStudioTools } from '@furria/ui/KkStudioTools';
import type { FC } from 'react';
import type { ActStudioMode } from '../hooks/use-act-studio-mode';
import { STUDIO_TOOLS, STUDIO_TOOLS_LABEL } from '../studio-copy';

interface ActStudioToolTabsProps {
  mode: ActStudioMode;
}

export const ActStudioToolTabs: FC<ActStudioToolTabsProps> = ({ mode }) => {
  const tools = STUDIO_TOOLS.filter((entry) => mode.tools.includes(entry.tool)).map((entry) => {
    const select = (): void => {
      mode.choose(entry.tool);
    };

    return (
      <KkStudioTools.Tool
        key={entry.tool}
        glyph={entry.tool}
        label={entry.label}
        selected={mode.tool === entry.tool}
        onSelect={select}
      />
    );
  });

  return <KkStudioTools label={STUDIO_TOOLS_LABEL}>{tools}</KkStudioTools>;
};
