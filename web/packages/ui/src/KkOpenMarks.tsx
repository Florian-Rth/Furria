import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkIconName } from './KkIcon';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';

export interface KkOpenMark {
  key: string;
  icon: KkIconName;
  label: string;
}

interface KkOpenMarksProps {
  marks: readonly KkOpenMark[];
  sx?: KkSx;
}

export const KkOpenMarks: FC<KkOpenMarksProps> = ({ marks, sx }) => {
  const items = marks.map((mark) => (
    <Stack
      key={mark.key}
      direction="row"
      component="span"
      sx={{ alignItems: 'center', gap: 0.375, color: 'text.primary' }}
    >
      <KkIcon name={mark.icon} size="small" />
      <Typography component="span" variant="caption" sx={{ fontWeight: 800, color: 'inherit' }}>
        {mark.label}
      </Typography>
    </Stack>
  ));

  return (
    <Stack
      direction="row"
      component="span"
      data-kk-open-marks
      sx={[
        { flexWrap: 'wrap', alignItems: 'center', columnGap: 1, rowGap: 0.25, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {items}
    </Stack>
  );
};
