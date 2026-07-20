import SvgIcon from '@mui/material/SvgIcon';
import type { FC } from 'react';

export const SunIcon: FC = () => (
  <SvgIcon viewBox="0 0 24 24">
    <circle cx={12} cy={12} r={4} fill="none" stroke="currentColor" strokeWidth={2} />
    <path
      d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </SvgIcon>
);
