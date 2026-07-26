import type { FC } from 'react';
import { CtaBand } from '@/components/CtaBand/CtaBand';
import { RecruitActions } from './internal/ui/RecruitActions';
import { RecruitCopy } from './internal/ui/RecruitCopy';
import { RecruitWatermark } from './internal/ui/RecruitWatermark';

export const RecruitBand: FC = () => (
  <CtaBand watermark={<RecruitWatermark />} sx={{ py: { xs: 8, md: 12 } }}>
    <CtaBand.Column>
      <RecruitCopy />
      <RecruitActions />
    </CtaBand.Column>
  </CtaBand>
);
