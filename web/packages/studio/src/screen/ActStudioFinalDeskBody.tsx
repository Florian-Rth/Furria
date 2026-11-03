import { ActStudioFinalGridBody } from '@furria/studio/ActStudioFinalGridBody';
import { ActStudioFinalSourceBody } from '@furria/studio/ActStudioFinalSourceBody';
import type { FinalDesk } from '@furria/studio/use-final-desk';
import type { FC } from 'react';

interface ActStudioFinalDeskBodyProps {
  desk: FinalDesk;
}

export const ActStudioFinalDeskBody: FC<ActStudioFinalDeskBodyProps> = ({ desk }) =>
  desk.kind === 'source' ? (
    <ActStudioFinalSourceBody desk={desk} />
  ) : (
    <ActStudioFinalGridBody desk={desk} />
  );
