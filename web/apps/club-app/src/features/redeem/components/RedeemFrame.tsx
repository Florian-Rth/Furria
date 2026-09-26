import { KkBrandStage, KkEyebrow, KkSplitLayout } from '@furria/ui';
import type { FC, PropsWithChildren } from 'react';
import { buildLoginStageMeta } from '@/features/login';

export const RedeemFrame: FC<PropsWithChildren> = ({ children }) => {
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
      <KkSplitLayout.Pane>{children}</KkSplitLayout.Pane>
    </KkSplitLayout>
  );
};
