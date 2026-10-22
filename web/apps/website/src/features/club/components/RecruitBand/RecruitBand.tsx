import { KkBandSection } from '@furria/ui/KkBandSection';
import { KkBandWatermark } from '@furria/ui/KkBandWatermark';
import { kkTokens } from '@furria/ui/tokens';
import type { FC } from 'react';
import { RecruitActions } from './internal/ui/RecruitActions';
import { RecruitCopy } from './internal/ui/RecruitCopy';

export const RecruitBand: FC = () => (
  <KkBandSection
    decoration={<KkBandWatermark side="center" />}
    sx={{ py: kkTokens.layout.sectionGap }}
  >
    <KkBandSection.Column>
      <RecruitCopy />
      <RecruitActions />
    </KkBandSection.Column>
  </KkBandSection>
);
