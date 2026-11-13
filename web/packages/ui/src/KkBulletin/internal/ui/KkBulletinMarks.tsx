import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkStateBadge } from '../../../KkStateBadge/KkStateBadge';
import { HIDDEN_FROM_SIGHT } from '../../../KkVisuallyHidden';
import type { KkSx } from '../../../kk-sx';
import type { KkBulletinMarkItem } from '../../bulletin';

interface KkBulletinMarksProps {
  marks: readonly KkBulletinMarkItem[];
  sx?: KkSx;
}

export const KkBulletinMarks: FC<KkBulletinMarksProps> = ({ marks, sx }) => {
  if (marks.length === 0) {
    return null;
  }

  const items = marks.map((mark) => (
    <Stack component="li" key={mark.key} sx={{ display: 'inline-flex' }}>
      <KkStateBadge icon={mark.icon} state={mark.state} size="small" />
      <Stack component="span" sx={HIDDEN_FROM_SIGHT}>
        {mark.label}
      </Stack>
    </Stack>
  ));

  return (
    <Stack
      direction="row"
      component="ul"
      sx={[
        { gap: 0.75, m: 0, p: 0, listStyle: 'none', flexShrink: 0, alignItems: 'center' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {items}
    </Stack>
  );
};
