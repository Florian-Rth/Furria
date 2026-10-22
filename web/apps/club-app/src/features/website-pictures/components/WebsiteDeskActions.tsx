import { KkButton } from '@furria/ui/KkButton';
import type { KkIconName } from '@furria/ui/KkIcon';
import { KkIcon } from '@furria/ui/KkIcon';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { DeskAction } from '../desk-actions';
import type { PositionDesk } from '../hooks/use-position-desk';
import { CANCEL_LABEL, DESK_ACTIONS, TRANSFER_LABEL } from '../website-copy';

interface ActionLook {
  label: string;
  icon: KkIconName | null;
  variant: 'contained' | 'outlined' | 'text';
  tone: 'default' | 'danger';
}

const LOOKS: Record<DeskAction, ActionLook> = {
  upload: { label: DESK_ACTIONS.upload, icon: 'upload', variant: 'contained', tone: 'default' },
  gallery: { label: DESK_ACTIONS.gallery, icon: 'gallery', variant: 'outlined', tone: 'default' },
  copy: { label: DESK_ACTIONS.copy, icon: 'copy', variant: 'outlined', tone: 'default' },
  crop: { label: DESK_ACTIONS.crop, icon: 'crop', variant: 'outlined', tone: 'default' },
  recut: { label: DESK_ACTIONS.recut, icon: 'crop', variant: 'contained', tone: 'default' },
  transfer: { label: TRANSFER_LABEL, icon: 'chevron', variant: 'contained', tone: 'default' },
  remove: { label: DESK_ACTIONS.remove, icon: 'delete', variant: 'text', tone: 'danger' },
  commit: { label: DESK_ACTIONS.cropDone, icon: 'check', variant: 'contained', tone: 'default' },
  retry: { label: DESK_ACTIONS.retry, icon: 'upload', variant: 'contained', tone: 'default' },
  cancel: { label: CANCEL_LABEL, icon: null, variant: 'text', tone: 'default' },
};

const handlerOf = (action: DeskAction, desk: PositionDesk): (() => void) => {
  switch (action) {
    case 'upload':
      return desk.chooseFile;
    case 'gallery':
      return desk.openGallery;
    case 'copy':
      return desk.openCopy;
    case 'crop':
    case 'recut':
      return desk.recrop;
    case 'transfer':
      return desk.openTransfer;
    case 'remove':
      return desk.removal.open;
    case 'commit':
    case 'retry':
      return desk.commit;
    case 'cancel':
      return desk.cancel;
  }
};

interface WebsiteDeskActionsProps {
  actions: readonly DeskAction[];
  desk: PositionDesk;
}

export const WebsiteDeskActions: FC<WebsiteDeskActionsProps> = ({ actions, desk }) => {
  const buttons = actions.map((action) => {
    const look = LOOKS[action];
    const icon = look.icon === null ? undefined : <KkIcon name={look.icon} size="small" />;
    const isCommit = action === 'commit';
    const disabled = isCommit && !desk.canCommit;
    const loading = isCommit && desk.phase === 'saving';
    const marginLeft = action === 'remove' ? 'auto' : 0;
    const handle = handlerOf(action, desk);
    return (
      <KkButton
        key={action}
        variant={look.variant}
        tone={look.tone}
        size="medium"
        startIcon={icon}
        disabled={disabled}
        loading={loading}
        onClick={handle}
        sx={{ ml: marginLeft }}
      >
        {look.label}
      </KkButton>
    );
  });

  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, minWidth: 0 }}>
      {buttons}
    </Stack>
  );
};
