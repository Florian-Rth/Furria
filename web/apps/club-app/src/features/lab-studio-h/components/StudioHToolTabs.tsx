import { KkStudioHTools } from '@furria/ui/KkStudioHTools';
import type { FC } from 'react';
import type { StudioHMode } from '../hooks/use-studio-h-mode';
import { STUDIO_H_TOOLS, STUDIO_H_TOOLS_LABEL } from '../studio-h-copy';

interface StudioHToolTabsProps {
  mode: StudioHMode;
}

export const StudioHToolTabs: FC<StudioHToolTabsProps> = ({ mode }) => {
  const tools = STUDIO_H_TOOLS.map((entry) => {
    const select = (): void => {
      mode.choose(entry.tool);
    };

    return (
      <KkStudioHTools.Tool
        key={entry.tool}
        glyph={entry.tool}
        label={entry.label}
        selected={mode.tool === entry.tool}
        onSelect={select}
      />
    );
  });

  return <KkStudioHTools label={STUDIO_H_TOOLS_LABEL}>{tools}</KkStudioHTools>;
};
