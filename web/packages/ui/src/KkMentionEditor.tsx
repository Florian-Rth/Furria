import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { useState } from 'react';
import { lineClamp } from './internal/line-clamp';
import { KkButton } from './KkButton';

const PAPER_STYLE = {
  mt: 0.75,
  p: 2,
  width: (theme: Theme) => theme.spacing(40),
  maxWidth: (theme: Theme) => `calc(100vw - ${theme.spacing(4)})`,
  borderRadius: 1,
} as const;

export interface KkMentionEditorLabels {
  field: string;
  target: string;
  remove: string;
  done: string;
}

interface KkMentionEditorProps {
  anchor: HTMLElement | null;
  label: string;
  targetName: string;
  targetLine: string;
  note?: string;
  labels: KkMentionEditorLabels;
  onLabelChange: (label: string) => void;
  onRemove: () => void;
  onClose: () => void;
}

export const KkMentionEditor: FC<KkMentionEditorProps> = ({
  anchor,
  label,
  targetName,
  targetLine,
  note,
  labels,
  onLabelChange,
  onRemove,
  onClose,
}) => {
  const [draft, setDraft] = useState(label);
  const [trackedAnchor, setTrackedAnchor] = useState(anchor);

  if (trackedAnchor !== anchor) {
    setTrackedAnchor(anchor);
    setDraft(label);
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const next = event.target.value;
    setDraft(next);
    if (next.trim().length > 0) {
      onLabelChange(next);
    }
  };
  const noteLine =
    note === undefined ? null : (
      <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
        {note}
      </Typography>
    );

  return (
    <Popover
      open={anchor !== null}
      anchorEl={anchor}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      disableRestoreFocus
      slotProps={{ paper: { sx: PAPER_STYLE } }}
    >
      <Stack sx={{ gap: 1.5 }} data-kk-mention-editor>
        <Stack sx={{ gap: 0.25 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {labels.target}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {targetName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', ...lineClamp(2) }}>
            {targetLine}
          </Typography>
          {noteLine}
        </Stack>
        <TextField
          size="small"
          label={labels.field}
          value={draft}
          onChange={handleChange}
          autoFocus
        />
        <Stack direction="row" sx={{ gap: 1, justifyContent: 'space-between' }}>
          <KkButton variant="text" tone="danger" size="small" onClick={onRemove}>
            {labels.remove}
          </KkButton>
          <KkButton variant="contained" size="small" onClick={onClose}>
            {labels.done}
          </KkButton>
        </Stack>
      </Stack>
    </Popover>
  );
};
