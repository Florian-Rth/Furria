import { KkBandSection, kkTokens } from '@furria/ui';
import type { FC } from 'react';
import { RecruitActions } from './internal/ui/RecruitActions';
import { RecruitCopy } from './internal/ui/RecruitCopy';
import { RecruitWatermark } from './internal/ui/RecruitWatermark';

export const RecruitBand: FC = () => (
  <KkBandSection decoration={<RecruitWatermark />} sx={{ py: kkTokens.layout.sectionGap }}>
    <KkBandSection.Column>
      <RecruitCopy />
      <RecruitActions />
    </KkBandSection.Column>
  </KkBandSection>
);
