import { SETUP_VIDEO_OTHER } from '@furria/studio/step-setup-copy';
import type { SetupVideoRow } from '@furria/studio/use-setup-video';
import { KkButton } from '@furria/ui/KkButton';
import { KkSetupSummary } from '@furria/ui/KkSetupSummary';
import type { FC } from 'react';

interface SetupVideoCheckProps {
  chosen: SetupVideoRow;
}

export const SetupVideoCheck: FC<SetupVideoCheckProps> = ({ chosen }) => {
  const change = (
    <KkButton variant="outlined" size="small" onClick={chosen.press}>
      {SETUP_VIDEO_OTHER}
    </KkButton>
  );

  return <KkSetupSummary title={chosen.title} meta={chosen.meta} action={change} />;
};
