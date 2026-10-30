import { KkSheet } from '@furria/ui/KkSheet';
import type { FC } from 'react';
import { CLOSE_LABEL, toDoorLabel, toSheetId, toSheetTitle } from '../act-c-copy';
import { hasSheet } from '../act-c-model';
import type { ActCView } from '../act-c-view';
import { ActCDoorContent } from './ActCDoorContent';

interface ActCSheetsProps {
  view: ActCView;
}

export const ActCSheets: FC<ActCSheetsProps> = ({ view }) => {
  const sheets = view.doors.filter(hasSheet).map((door) => {
    const title = toSheetTitle(door, toDoorLabel(door, view.template, view.kind));

    return (
      <KkSheet key={door} id={toSheetId(door)} title={title} closeLabel={CLOSE_LABEL}>
        <KkSheet.Body>
          <ActCDoorContent view={view} door={door} />
        </KkSheet.Body>
      </KkSheet>
    );
  });

  return <>{sheets}</>;
};
