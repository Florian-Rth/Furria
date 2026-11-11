import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const FACE_BORDER_WIDTH = 1.5;

interface KkMomentFaceProps extends PropsWithChildren {
  invalid: boolean;
}

export const KkMomentFace: FC<KkMomentFaceProps> = ({ invalid, children }) => {
  const borderColor = invalid ? 'error.main' : 'divider';

  return (
    <Stack
      direction="row"
      data-kk-moment-face
      sx={{
        minWidth: 0,
        alignItems: 'stretch',
        borderWidth: FACE_BORDER_WIDTH,
        borderStyle: 'solid',
        borderColor,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: 'background.paper',
        '& > [data-kk-moment-segment] + [data-kk-moment-segment]': {
          borderLeftWidth: FACE_BORDER_WIDTH,
          borderLeftStyle: 'solid',
          borderLeftColor: 'divider',
        },
      }}
    >
      {children}
    </Stack>
  );
};
