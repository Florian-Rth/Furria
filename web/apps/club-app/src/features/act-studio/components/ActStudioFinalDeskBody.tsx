import type { FC } from 'react';
import type { FinalDesk } from '../hooks/use-final-desk';
import { ActStudioFinalGridBody } from './ActStudioFinalGridBody';
import { ActStudioFinalSourceBody } from './ActStudioFinalSourceBody';

interface ActStudioFinalDeskBodyProps {
  desk: FinalDesk;
}

export const ActStudioFinalDeskBody: FC<ActStudioFinalDeskBodyProps> = ({ desk }) =>
  desk.kind === 'source' ? (
    <ActStudioFinalSourceBody desk={desk} />
  ) : (
    <ActStudioFinalGridBody desk={desk} />
  );
