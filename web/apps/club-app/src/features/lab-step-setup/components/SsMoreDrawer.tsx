import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { SS_MORE_CLOSE } from '../setup-copy';
import type { SetupTool } from '../setup-task';
import { SsToolButton } from './SsToolButton';

interface SsMoreDrawerProps {
  title: string;
  tools: readonly SetupTool[];
  onClose: () => void;
}

export const SsMoreDrawer: FC<SsMoreDrawerProps> = ({ title, tools, onClose }) => {
  const buttons = tools.map((tool) => {
    const press = (): void => {
      onClose();
      tool.press();
    };

    return <SsToolButton key={tool.key} tool={{ ...tool, press }} wide />;
  });

  return (
    <KkBottomDrawer open label={title} closeLabel={SS_MORE_CLOSE} onClose={onClose}>
      <Stack sx={{ gap: 1, px: 2, pb: 3 }}>
        <KkEyebrow tone="muted">{title}</KkEyebrow>
        {buttons}
      </Stack>
    </KkBottomDrawer>
  );
};
