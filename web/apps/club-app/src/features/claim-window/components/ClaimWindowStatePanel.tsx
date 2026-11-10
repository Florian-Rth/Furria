import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkStatusLine } from '@furria/ui/KkStatusLine';
import type { FC } from 'react';
import { toWindowOpenState, WINDOW_CLOSED_STATE, WINDOW_STATE_TITLE } from '../claim-window-copy';
import { formatWindowMoment } from '../claim-window-format';
import type { ClaimWindowSpan } from '../schemas';

interface ClaimWindowStatePanelProps {
  window: ClaimWindowSpan | null;
}

export const ClaimWindowStatePanel: FC<ClaimWindowStatePanelProps> = ({ window }) => {
  const line =
    window === null ? (
      <KkStatusLine tone="quiet" text={WINDOW_CLOSED_STATE} />
    ) : (
      <KkStatusLine tone="done" text={toWindowOpenState(formatWindowMoment(window.closesAt))} />
    );

  return (
    <KkPanelSection title={WINDOW_STATE_TITLE}>
      <KkPanel>{line}</KkPanel>
    </KkPanelSection>
  );
};
