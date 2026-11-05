import type { KkNoticeLabels } from '@furria/ui/KkNotice';
import { KkNoticeProvider } from '@furria/ui/KkNotice';
import { KkTabStage } from '@furria/ui/KkTabStage';
import type { FC, PropsWithChildren } from 'react';
import {
  NOTICE_COLLAPSE_LABEL,
  NOTICE_DISMISS_LABEL,
  NOTICE_EXPAND_LABEL,
} from '@/features/session/session-messages';

const NOTICE_LABELS: KkNoticeLabels = {
  dismiss: NOTICE_DISMISS_LABEL,
  expand: NOTICE_EXPAND_LABEL,
  collapse: NOTICE_COLLAPSE_LABEL,
};

export const BeerBookFrame: FC<PropsWithChildren> = ({ children }) => (
  <KkNoticeProvider labels={NOTICE_LABELS} systemNotice={null}>
    <KkTabStage>{children}</KkTabStage>
  </KkNoticeProvider>
);
