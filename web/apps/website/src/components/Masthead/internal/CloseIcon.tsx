import SvgIcon from '@mui/material/SvgIcon';
import type { FC } from 'react';

export const CloseIcon: FC = () => (
  <SvgIcon viewBox="0 0 24 24">
    <path
      d="M6 6l12 12M18 6L6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    />
  </SvgIcon>
);
