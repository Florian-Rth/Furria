import { KkButton } from '@furria/ui/KkButton';
import type { FC } from 'react';
import type { SetupTool } from '../setup-task';

interface SsToolButtonProps {
  tool: SetupTool;
  wide?: boolean;
}

export const SsToolButton: FC<SsToolButtonProps> = ({ tool, wide = false }) => (
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
