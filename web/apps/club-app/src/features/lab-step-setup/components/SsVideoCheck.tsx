import { KkButton } from '@furria/ui/KkButton';
import { KkSsSummary } from '@furria/ui/KkSsSummary';
import type { FC } from 'react';
import type { SetupVideoRow } from '../hooks/use-setup-video';
import { SS_VIDEO_OTHER } from '../setup-copy';

interface SsVideoCheckProps {
  chosen: SetupVideoRow;
}

export const SsVideoCheck: FC<SsVideoCheckProps> = ({ chosen }) => {
  const change = (
    <KkButton variant="outlined" size="small" onClick={chosen.press}>
      {SS_VIDEO_OTHER}
    </KkButton>
  );

  return <KkSsSummary title={chosen.title} meta={chosen.meta} action={change} />;
};
