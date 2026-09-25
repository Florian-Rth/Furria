import { KkBrandStage, KkEyebrow, KkSplitLayout } from '@furria/ui';
import type { FC } from 'react';
import { buildLoginStageMeta } from '@/features/login';
import { useRedeemScreen } from '../hooks/use-redeem-screen';
import { RedeemBody } from './RedeemBody';

export const RedeemScreen: FC = () => {
  const control = useRedeemScreen();
  const stageMeta = buildLoginStageMeta(new Date());

  return (
    <KkSplitLayout>
      <KkSplitLayout.Stage>
        <KkBrandStage variant="band">
          <KkBrandStage.Meta>
            <KkEyebrow tone="muted">{stageMeta.place}</KkEyebrow>
            <KkEyebrow tone="muted">{stageMeta.session}</KkEyebrow>
          </KkBrandStage.Meta>
        </KkBrandStage>
      </KkSplitLayout.Stage>
      <KkSplitLayout.Pane>
        <RedeemBody control={control} />
      </KkSplitLayout.Pane>
    </KkSplitLayout>
  );
};
