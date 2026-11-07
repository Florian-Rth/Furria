import { KkAlert } from '@furria/ui/KkAlert';
import { KkBannerDesk } from '@furria/ui/KkBannerDesk';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import type { KkSx } from '@furria/ui/kk-sx';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { DragEvent, FC } from 'react';
import { PICTURE_ACCEPT } from '@/features/pictures/picture-target';
import type { SessionLogoControl } from '../hooks/use-session-logo';
import {
  LOGO_DRAG_HINT,
  LOGO_FIELD_LABEL,
  SESSION_LOGO_DESK_LABELS,
} from '../manage-sessions-labels';

const LOGO_DESK_HEIGHT = 40;
const POINTER_ONLY = { display: 'none', '@media (pointer: fine)': { display: 'block' } } as const;

interface SessionLogoFieldProps {
  logo: SessionLogoControl;
  label: string;
}

export const SessionLogoField: FC<SessionLogoFieldProps> = ({ logo, label }) => {
  const { banner, note, rejection, actions } = logo;

  const dragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
  };

  const drop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    logo.pick(event.dataTransfer.files[0] ?? null);
  };

  const deskFrame: KkSx = (theme) => ({
    width: '100%',
    maxWidth: theme.spacing(LOGO_DESK_HEIGHT * banner.aspect),
  });
  const status = note === null ? null : <KkMeta>{note}</KkMeta>;
  const failure = rejection === null ? null : <KkAlert severity="error">{rejection}</KkAlert>;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }} onDragOver={dragOver} onDrop={drop}>
      <KkEyebrow tone="muted">{LOGO_FIELD_LABEL}</KkEyebrow>
      <Box sx={deskFrame}>
        <KkBannerDesk
          id="session-logo"
          aspect={banner.aspect}
          state={banner.state}
          preview={banner.preview}
          source={banner.source}
          uncroppedSource={banner.uncroppedSource}
          crop={banner.crop}
          progress={0}
          alt={label}
          readOnly={false}
          labels={SESSION_LOGO_DESK_LABELS}
          actions={actions}
        />
      </Box>
      <Box
        component="input"
        type="file"
        accept={PICTURE_ACCEPT}
        ref={logo.fileInputRef}
        onChange={logo.onFileChosen}
        hidden
      />
      {status}
      <KkMeta sx={POINTER_ONLY}>{LOGO_DRAG_HINT}</KkMeta>
      {failure}
    </Stack>
  );
};
