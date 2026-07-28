import Collapse from '@mui/material/Collapse';
import type { FC, PropsWithChildren } from 'react';

interface OlderSessionPanelProps extends PropsWithChildren {
  id: string;
  labelledBy: string;
  expanded: boolean;
  timeout: number;
}

export const OlderSessionPanel: FC<OlderSessionPanelProps> = ({
  id,
  labelledBy,
  expanded,
  timeout,
  children,
}) => (
  <Collapse
    data-kk-older-session-panel
    id={id}
    role="region"
    aria-labelledby={labelledBy}
    in={expanded}
    timeout={timeout}
  >
    {children}
  </Collapse>
);
