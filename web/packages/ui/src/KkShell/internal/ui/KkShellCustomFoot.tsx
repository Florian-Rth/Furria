import Box from '@mui/material/Box';
import type { FC, PropsWithChildren, Ref } from 'react';

interface KkShellCustomFootProps extends PropsWithChildren {
  ref?: Ref<HTMLDivElement>;
}

export const KkShellCustomFoot: FC<KkShellCustomFootProps> = ({ ref, children }) => (
  <Box ref={ref} data-kk-shell-custom-foot sx={{ minWidth: 0 }}>
    {children}
  </Box>
);
