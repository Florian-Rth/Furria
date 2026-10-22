import { KkBrandStage } from '@furria/ui/KkBrandStage';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkSplitLayout } from '@furria/ui/KkSplitLayout';
import type { FC, PropsWithChildren } from 'react';
import { buildLoginStageMeta } from '@/features/login/stage-meta';

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
