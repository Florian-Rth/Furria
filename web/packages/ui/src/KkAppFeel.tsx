import GlobalStyles from '@mui/material/GlobalStyles';
import type { FC } from 'react';

const appFeel = {
  'html, body': {
    overscrollBehavior: 'none',
  },
} as const;

export const KkAppFeel: FC = () => <GlobalStyles styles={appFeel} />;
