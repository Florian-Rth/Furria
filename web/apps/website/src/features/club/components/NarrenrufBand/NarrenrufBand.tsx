import type { FC } from 'react';
import { CtaBand } from '@/components/CtaBand/CtaBand';
import { NarrenrufCopy } from './internal/ui/NarrenrufCopy';
import { NarrenrufShout } from './internal/ui/NarrenrufShout';
import { NarrenrufWatermark } from './internal/ui/NarrenrufWatermark';

export const NarrenrufBand: FC = () => (
  <CtaBand watermark={<NarrenrufWatermark />} sx={{ py: { xs: 6, md: 10 } }}>
    <CtaBand.Row>
      <NarrenrufCopy />
      <NarrenrufShout />
    </CtaBand.Row>
  </CtaBand>
);
