import { KkChoiceChips } from '@furria/ui/KkChoiceChips';
import { KkTouchLab } from '@furria/ui/KkTouchLab';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { StudioLabTool } from '../studio-lab-tools';

interface StudioLabToolsProps {
  tools: readonly StudioLabTool[];
}

export const StudioLabTools: FC<StudioLabToolsProps> = ({ tools }) => (
  <Stack sx={{ gap: 1 }}>
    {tools.map((tool) => (
      <Stack key={tool.key} direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <KkTouchLab.Hint text={tool.label} />
        <KkChoiceChips
          label={tool.label}
          choices={tool.choices}
          value={tool.value}
          onChange={tool.onChange}
        />
      </Stack>
    ))}
  </Stack>
);
