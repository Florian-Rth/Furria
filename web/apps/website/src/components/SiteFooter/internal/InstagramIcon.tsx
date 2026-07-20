import SvgIcon from '@mui/material/SvgIcon';
import type { FC } from 'react';

export const InstagramIcon: FC = () => (
  <SvgIcon viewBox="0 0 24 24" fontSize="small">
    <rect
      x={3.5}
      y={3.5}
      width={17}
      height={17}
      rx={5}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    />
    <circle cx={12} cy={12} r={4} fill="none" stroke="currentColor" strokeWidth={2} />
    <circle cx={17} cy={7} r={1.3} />
  </SvgIcon>
);
