import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import { KkIconButton } from './KkIconButton';
import { kkTokens } from './tokens';

interface KkTieSlotProps {
  id: string;
  releaseLabel: string;
  droppedNote?: string;
  readOnly: boolean;
  onRelease: () => void;
  children: ReactNode;
}

export const KkTieSlot: FC<KkTieSlotProps> = ({
  id,
  releaseLabel,
  droppedNote,
  readOnly,
  onRelease,
  children,
}) => {
  const isDropped = droppedNote !== undefined;
  const note = isDropped ? (
    <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
      {droppedNote}
    </Typography>
  ) : null;
  const release = readOnly ? null : (
    <KkIconButton label={releaseLabel} icon="close" size="small" onClick={onRelease} />
  );

  return (
    <Stack
      id={id}
      data-kk-tie-slot={isDropped ? 'dropped' : 'shown'}
      sx={{
        minWidth: 0,
        gap: 0.75,
        p: 1,
        pl: 1.25,
        border: 1,
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        opacity: isDropped ? kkTokens.opacity.dimmed : 1,
      }}
    >
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', minWidth: 0 }}>
        <Stack sx={{ flex: 1, minWidth: 0 }}>{children}</Stack>
        {release}
      </Stack>
      {note}
    </Stack>
  );
};
