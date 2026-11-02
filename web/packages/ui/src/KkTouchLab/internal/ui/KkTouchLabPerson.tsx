import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { touchLabPalette } from '../../touch-lab-paint';

interface KkTouchLabPersonProps {
  personRef: (element: Element | null) => void;
  name: string;
  dragging: boolean;
}

export const KkTouchLabPerson: FC<KkTouchLabPersonProps> = ({ personRef, name, dragging }) => (
  <Stack
    direction="row"
    ref={personRef}
    data-dragging={dragging}
    sx={(theme) => ({
      minHeight: '2rem',
      px: 1.25,
      alignItems: 'center',
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: touchLabPalette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${touchLabPalette(theme).divider}`,
      touchAction: 'none',
      cursor: 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      WebkitTouchCallout: 'none',
      '&[data-dragging="true"]': {
        boxShadow: kkTokens.shadow.floating,
        backgroundColor: touchLabPalette(theme).primary.main,
        color: touchLabPalette(theme).primary.contrastText,
      },
    })}
  >
    <Typography variant="caption" sx={{ fontWeight: 800, color: 'inherit', whiteSpace: 'nowrap' }}>
      {name}
    </Typography>
  </Stack>
);
