import { KkSelectRow } from '@furria/ui/KkSelectRow';
import { KkSheet } from '@furria/ui/KkSheet';
import { KkText } from '@furria/ui/KkText';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { TransferTarget } from '../transfer-targets';
import type { SlotPositionRef } from '../types';
import {
  CLOSE_LABEL,
  TRANSFER_NONE,
  TRANSFER_NOTE,
  TRANSFER_SHEET_ID,
  TRANSFER_TITLE,
} from '../website-copy';

interface WebsiteTransferSheetProps {
  targets: readonly TransferTarget[];
  onPick: (target: SlotPositionRef) => void;
}

export const WebsiteTransferSheet: FC<WebsiteTransferSheetProps> = ({ targets, onPick }) => {
  const rows = targets.map((target) => {
    const pick = (): void => {
      onPick({ slot: target.slot, position: target.position });
    };
    return (
      <KkSelectRow
        key={`${target.slot}:${target.position}`}
        title={target.name}
        meta={target.page}
        onClick={pick}
      />
    );
  });
  const empty = targets.length === 0 ? <KkText variant="body2">{TRANSFER_NONE}</KkText> : null;

  return (
    <KkSheet id={TRANSFER_SHEET_ID} title={TRANSFER_TITLE} closeLabel={CLOSE_LABEL}>
      <KkSheet.Body>
        <KkText variant="caption">{TRANSFER_NOTE}</KkText>
        <Stack>
          {rows}
          {empty}
        </Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
