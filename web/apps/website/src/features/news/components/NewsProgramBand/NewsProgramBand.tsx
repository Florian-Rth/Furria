import type { FC } from 'react';
import { CtaBand } from '@/components/CtaBand/CtaBand';
import { NewsProgramCopy } from './internal/ui/NewsProgramCopy';
import { NewsProgramCta } from './internal/ui/NewsProgramCta';
import { NewsProgramWatermark } from './internal/ui/NewsProgramWatermark';

export const NewsProgramBand: FC = () => (
  <CtaBand watermark={<NewsProgramWatermark />} sx={{ py: { xs: 6, md: 10 } }}>
    <CtaBand.Row>
      <NewsProgramCopy />
      <NewsProgramCta />
    </CtaBand.Row>
  </CtaBand>
);
