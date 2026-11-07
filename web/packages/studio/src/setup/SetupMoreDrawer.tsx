import { SetupToolButton } from '@furria/studio/SetupToolButton';
import type { SetupTool } from '@furria/studio/setup-task';
import { SETUP_MORE_CLOSE } from '@furria/studio/step-setup-copy';
import { KkBottomDrawer } from '@furria/ui/KkBottomDrawer';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';

interface SetupMoreDrawerProps {
  title: string;
  tools: readonly SetupTool[];
  onClose: () => void;
}

export const SetupMoreDrawer: FC<SetupMoreDrawerProps> = ({ title, tools, onClose }) => {
  const buttons = tools.map((tool) => {
    const press = (): void => {
      onClose();
      tool.press();
    };

    return <SetupToolButton key={tool.key} tool={{ ...tool, press }} wide />;
  });

  return (
    <KkBottomDrawer open label={title} closeLabel={SETUP_MORE_CLOSE} onClose={onClose}>
      <Stack sx={{ gap: 1, px: 2, pb: 3 }}>
        <KkEyebrow tone="muted">{title}</KkEyebrow>
        {buttons}
      </Stack>
    </KkBottomDrawer>
  );
};
