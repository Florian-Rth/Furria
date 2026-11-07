import { SS_VIDEO_OTHER } from '@furria/studio/step-setup-copy';
import type { SetupVideoRow } from '@furria/studio/use-setup-video';
import { KkButton } from '@furria/ui/KkButton';
import { KkSsSummary } from '@furria/ui/KkSsSummary';
import type { FC } from 'react';

interface SetupVideoCheckProps {
  chosen: SetupVideoRow;
}

export const SetupVideoCheck: FC<SetupVideoCheckProps> = ({ chosen }) => {
  const change = (
    <KkButton variant="outlined" size="small" onClick={chosen.press}>
      {SS_VIDEO_OTHER}
    </KkButton>
  );

  return <KkSsSummary title={chosen.title} meta={chosen.meta} action={change} />;
};
