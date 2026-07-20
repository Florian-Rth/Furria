import SvgIcon from '@mui/material/SvgIcon';
import type { FC } from 'react';

export const YoutubeIcon: FC = () => (
  <SvgIcon viewBox="0 0 24 24" fontSize="small">
    <rect
      x={2.5}
      y={5.5}
      width={19}
      height={13}
      rx={3.5}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    />
    <path d="M10.5 9.25v5.5L15.25 12z" />
  </SvgIcon>
);
