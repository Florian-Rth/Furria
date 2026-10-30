import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import { CLOSE_LABEL, toDoorLabel, toSheetId, toSheetTitle } from '../act-card-copy';
import { hasSheet } from '../act-card-model';
import type { ActCardView } from '../act-card-view';
import { ActCardDoorContent } from './ActCardDoorContent';

interface ActCardSheetsProps {
  view: ActCardView;
}

export const ActCardSheets: FC<ActCardSheetsProps> = ({ view }) => {
  const sheets = view.doors.filter(hasSheet).map((door) => {
    const title = toSheetTitle(door, toDoorLabel(door, view.template, view.kind));

    return (
      <KkSheet key={door} id={toSheetId(door)} title={title} closeLabel={CLOSE_LABEL}>
        <KkSheet.Body>
          <ActCardDoorContent view={view} door={door} />
        </KkSheet.Body>
      </KkSheet>
    );
  });

  return <>{sheets}</>;
};
