import { KkAlert } from '@furria/ui/KkAlert';
import { KkButton } from '@furria/ui/KkButton';
import { KkEyebrow } from '@furria/ui/KkEyebrow';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkPanel } from '@furria/ui/KkPanel';
import Stack from '@mui/material/Stack';
import type { ChangeEvent, DragEvent, FC } from 'react';
import { useRef, useState } from 'react';
import { PICTURE_ACCEPT } from '@/features/pictures/picture-target';
import type { SessionLogoControl } from '../hooks/use-session-logo';
import {
  LOGO_DRAG_HINT,
  LOGO_FIELD_LABEL,
  LOGO_REMOVE_LABEL,
  toLogoFieldHint,
} from '../manage-sessions-labels';
import { SessionLogoMark } from './SessionLogoMark';

const PREVIEW_SIZE = 56;
const POINTER_ONLY = { display: 'none', '@media (pointer: fine)': { display: 'block' } } as const;

interface SessionLogoFieldProps {
  logo: SessionLogoControl;
  label: string;
}

export const SessionLogoField: FC<SessionLogoFieldProps> = ({ logo, label }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOver, setOver] = useState(false);
  const { hasLogo, image, statusLine, rejection, pick: onPick, clear: onClear } = logo;

  const openPicker = (): void => {
    inputRef.current?.click();
  };

  const change = (event: ChangeEvent<HTMLInputElement>): void => {
    onPick(event.target.files?.[0] ?? null);
    event.target.value = '';
  };

  const dragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setOver(true);
  };

  const dragLeave = (): void => {
    setOver(false);
  };

  const drop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setOver(false);
    onPick(event.dataTransfer.files[0] ?? null);
  };

  const hint = toLogoFieldHint(isOver, hasLogo);
  const panelTone: 'raised' | 'reserved' = hasLogo ? 'raised' : 'reserved';

  const mark =
    image === null ? null : <SessionLogoMark image={image} label={label} size={PREVIEW_SIZE} />;
  const status = statusLine === null ? null : <KkMeta>{statusLine}</KkMeta>;

  const preview = hasLogo ? (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      {mark}
      {status}
    </Stack>
  ) : null;

  const removal = hasLogo ? (
    <KkButton size="small" variant="text" tone="danger" onClick={onClear}>
      {LOGO_REMOVE_LABEL}
    </KkButton>
  ) : null;

  const failure = rejection === null ? null : <KkAlert severity="error">{rejection}</KkAlert>;

  return (
    <Stack sx={{ gap: 1, minWidth: 0 }} onDragOver={dragOver} onDragLeave={dragLeave} onDrop={drop}>
      <KkEyebrow tone="muted">{LOGO_FIELD_LABEL}</KkEyebrow>
      <input hidden ref={inputRef} type="file" accept={PICTURE_ACCEPT} onChange={change} />
      <KkPanel variant="block" tone={panelTone} chevron={false} onClick={openPicker}>
        <Stack sx={{ gap: 1, minWidth: 0, alignItems: 'flex-start' }}>
          {preview}
          <KkMeta>{hint}</KkMeta>
          <KkMeta sx={POINTER_ONLY}>{LOGO_DRAG_HINT}</KkMeta>
        </Stack>
      </KkPanel>
      {removal}
      {failure}
    </Stack>
  );
};
