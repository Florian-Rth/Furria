import Slide from '@mui/material/Slide';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';

const INSTANT = 0;

interface KkNoticeRiseProps extends PropsWithChildren {
  open: boolean;
  onExited?: () => void;
}

export const KkNoticeRise: FC<KkNoticeRiseProps> = ({ open, onExited, children }) => {
  const reducedMotion = useReducedMotion();
  const timeout = reducedMotion ? INSTANT : undefined;

  return (
    <Slide
      direction="up"
      in={open}
      appear
      mountOnEnter
      unmountOnExit
      timeout={timeout}
      onExited={onExited}
    >
      <Stack sx={{ minWidth: 0 }}>{children}</Stack>
    </Slide>
  );
};
