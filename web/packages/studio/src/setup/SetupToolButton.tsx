import type { SetupTool } from '@furria/studio/setup-task';
import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';

interface SetupToolButtonProps {
  tool: SetupTool;
  wide?: boolean;
}

export const SetupToolButton: FC<SetupToolButtonProps> = ({ tool, wide = false }) => (
  <KkButton
    variant="outlined"
    size="small"
    fullWidth={wide}
    ariaLabel={tool.label ?? undefined}
    onClick={tool.press}
  >
    {tool.text}
  </KkButton>
);
