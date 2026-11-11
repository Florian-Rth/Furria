import GlobalStyles from '@mui/material/GlobalStyles';
import type { FC } from 'react';

const appFeel = {
  'html, body': {
    overscrollBehavior: 'none',
  },
  html: {
    touchAction: 'pan-x pan-y',
  },
} as const;

export const KkAppFeel: FC = () => <GlobalStyles styles={appFeel} />;
