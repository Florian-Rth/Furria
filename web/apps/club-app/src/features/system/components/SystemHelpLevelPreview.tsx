import { KkChip } from '@furria/ui/KkChip';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { SYSTEM_HELP_LEVELS } from '../system-help-copy';
import { levelChipToneOf } from '../system-verdict';

const OK_TONE = levelChipToneOf('ok');
const ATTENTION_TONE = levelChipToneOf('attention');

export const SystemHelpLevelPreview: FC = () => (
  <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', minWidth: 0 }}>
    <KkChip tone={OK_TONE} dot>
      {SYSTEM_HELP_LEVELS.ok}
    </KkChip>
    <KkChip tone={ATTENTION_TONE} dot>
      {SYSTEM_HELP_LEVELS.attention}
    </KkChip>
  </Stack>
);
